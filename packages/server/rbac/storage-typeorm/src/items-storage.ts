import { DataSource, QueryRunner } from 'typeorm';
import moment from 'moment';

import {
  AccessType,
  CustomFields,
  ItemsStorage,
  Item,
  Permission,
  Role,
  TypesItem,
} from '@owl-app/rbac-manager';
import { isEmpty } from '@owl-app/utils';

import { Hierarchy, RawItem, RawItemChild } from './types';
import { ItemTreeTraversal } from './item-tree-traversal/item-tree-traversal';
import { ItemTreeTraversalFactory } from './item-tree-traversal/item-tree-traversal-factory';
import { BaseStorage } from './base.storage';
import { ItemFactory } from './item.factory';
import { DefaultItemFactory } from './default-item.factory';

export class TypeOrmItemsStorage extends BaseStorage implements ItemsStorage<Permission, Role> {
  private treeTraversal?: ItemTreeTraversal<RawItem> = null;

  private factoryItem?: ItemFactory<RawItem> = null;

  readonly childrenTableName: string | null;

  constructor(
    readonly dataSource: DataSource,
    readonly tableName: string,
    factoryItem: ItemFactory<RawItem>,
    childrenTableName: string | null = null,
    readonly namesSeparator = ','
  ) {
    super(dataSource);
    this.factoryItem = factoryItem ?? new DefaultItemFactory<RawItem>();
    this.childrenTableName = childrenTableName ?? `${tableName}_child`;
  }

  async clear(): Promise<void> {
    await this.transactional(async (queryRunner: QueryRunner): Promise<void> => {
      await queryRunner.query(`DELETE FROM ${this.childrenTableName}`);
      await queryRunner.query(`DELETE FROM ${this.tableName}`);
    });
  }

  async getAll(): Promise<Array<AccessType>> {
    const rawItems: Array<RawItem> = await this.singleQuery(
      `SELECT * FROM ${this.childrenTableName}`
    );

    return rawItems.map((item): AccessType => this.createItem(item));
  }

  async getByNames(names: string[]): Promise<Record<string, AccessType>> {
    if (names.length === 0) {
      return {};
    }

    const rawItems = await this.dataSource
      .createQueryBuilder()
      .select()
      .from(this.tableName, this.tableName)
      .where('name IN (:...names)', { names })
      .getRawMany();

    return this.getItemsIndexedByName(rawItems);
  }

  async get(name: string): Promise<AccessType | null> {
    const rawItem: Array<RawItem> = await this.singleQuery(
      `SELECT * FROM ${this.tableName} WHERE name = "${name}" LIMIT 1`
    );

    return isEmpty(rawItem) ? null : this.createItem(rawItem[0]);
  }

  async exists(name: string): Promise<boolean> {
    const result: Array<RawItem> = await this.singleQuery(
      `SELECT * FROM ${this.tableName} WHERE name = "${name}" LIMIT 1`
    );

    return result.length > 0;
  }

  async roleExists(name: string): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .select('1 AS role_exists')
      .from(this.tableName, this.tableName)
      .where('name = :name', { name })
      .andWhere('type = :type', { type: TypesItem.ROLE })
      .getRawOne();

    return result !== false;
  }

  async add(item: Item, customFields?: CustomFields[]): Promise<void> {
    let customFieldNames: string[] = [];
    let customFieldsValues: unknown[] = [];

    if (customFields) {
      customFieldNames = customFields.map((field) => field.name);
      customFieldsValues = customFields.map((field) => field.value);
    }

    await this.singleQuery(
      `
      INSERT INTO ${this.tableName} (name, description, rule_name, created_at, updated_at, type ${
        customFieldNames.length > 0 ? `,${customFieldNames.join(',')}` : ''
      })
      VALUES(?,?,?,?,?,? ${
        customFieldNames.length > 0 ? `,${customFieldNames.map(() => '?').join(',')}` : ''
      })`,
      [
        item.name,
        item.description,
        item.ruleName,
        moment(item.createdAt ?? new Date()).format('YYYY-MM-DD HH:mm:ss'),
        moment(item.updatedAt ?? new Date()).format('YYYY-MM-DD HH:mm:ss'),
        item.type,
        ...customFieldsValues,
      ]
    );
  }

  async update(name: string, item: Item): Promise<void> {
    item.updatedAt = new Date();

    await this.transactional(async (queryRunner: QueryRunner): Promise<void> => {
      const rawItems: Array<RawItemChild> = await queryRunner.query(
        `SELECT * FROM ${this.childrenTableName} WHERE parent = ? OR child = ?`,
        [name, name]
      );

      if (rawItems.length > 0) {
        await this.removeRelatedItemsChildren(queryRunner, name);
      }

      await queryRunner.query(
        `UPDATE ${this.tableName} SET name=?, description=?, rule_name=?, updated_at=? WHERE name=?`,
        [
          item.name,
          item.description,
          item.ruleName,
          moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
          name,
        ]
      );

      if (rawItems.length > 0) {
        const itemsChildren: Array<Array<string>> = rawItems.map(
          (itemChild: RawItemChild): Array<string> => {
            if (itemChild.parent === name) {
              itemChild.parent = item.name;
            }

            if (itemChild.child === name) {
              itemChild.child = item.name;
            }

            return [itemChild.parent, itemChild.child];
          }
        );

        let sqlMoveChildrens = `INSERT INTO ${this.childrenTableName} (parent, child) VALUES `;
        itemsChildren.forEach((children) => {
          sqlMoveChildrens += `("${children[0]}","${children[1]}"),`;
        });
        await queryRunner.query(sqlMoveChildrens.slice(0, -1));
      }
    });
  }

  async remove(name: string): Promise<void> {
    await this.transactional(async (queryRunner: QueryRunner): Promise<void> => {
      await this.removeRelatedItemsChildren(queryRunner, name);
      await queryRunner.query(`DELETE FROM ${this.tableName} WHERE name = ?`, [name]);
    });
  }

  async getRoles(): Promise<Role[]> {
    const roles = await this.getItemsByType(TypesItem.ROLE);

    return roles;
  }

  async getRolesByNames(names: string[]): Promise<Record<string, Role>> {
    if (!names) {
      return {};
    }

    const rawItems = await this.dataSource
      .createQueryBuilder()
      .select()
      .from(this.tableName, this.tableName)
      .where('type = :type', { type: TypesItem.ROLE })
      .andWhere('name IN (:...names)', { names })
      .getRawMany();

    return this.getItemsIndexedByName(rawItems);
  }

  async getRole(name: string): Promise<Role | null> {
    const role = await this.getItemByTypeAndName(TypesItem.ROLE, name);

    return role;
  }

  async clearRoles(): Promise<void> {
    await this.clearItemsByType(TypesItem.ROLE);
  }

  async getPermissions(): Promise<Permission[]> {
    return this.getItemsByType(TypesItem.PERMISSION);
  }

  async getPermissionsByNames(names: string[]): Promise<Record<string, Permission>> {
    if (!names) {
      return {};
    }

    const rawItems = await this.dataSource
      .createQueryBuilder()
      .select()
      .from(this.tableName, this.tableName)
      .where('type = :type', { type: TypesItem.PERMISSION })
      .andWhere('name IN (:...names)', { names })
      .getRawMany();

    return this.getItemsIndexedByName(rawItems);
  }

  async getPermission(name: string): Promise<Permission | null> {
    const permission = await this.getItemByTypeAndName(TypesItem.PERMISSION, name);

    return permission;
  }

  async clearPermissions(): Promise<void> {
    await this.clearItemsByType(TypesItem.PERMISSION);
  }

  async getParents(name: string): Promise<Record<string, AccessType>> {
    const rawItems = await this.getTreeTraversal().getParentRows(name);

    return this.getItemsIndexedByName(rawItems);
  }

  async getHierarchy(
    name: string
  ): Promise<Record<string, { item: AccessType; children: Record<string, AccessType> }>> {
    const tree: Record<string, { item: AccessType; children: Record<string, AccessType> }> = {};
    const childrenNamesMap: Record<string, string[]> = {};

    Object.values(await this.getTreeTraversal().getHierarchy(name)).forEach((data: Hierarchy) => {
      childrenNamesMap[data.name] =
        data.children !== '' ? data.children.split(this.namesSeparator) : [];

      delete data.children;
      tree[data.name] = { item: this.createItem(data as unknown as RawItem), children: {} };
    });

    Object.keys(tree).forEach((index) => {
      const children: Record<string, AccessType> = {};

      childrenNamesMap[index].forEach((childrenName) => {
        if (!tree[childrenName]) {
          throw new Error(`
              Separator is used to join and split children names during building hierarchy. It can not be part of item name. Either
              customize separator via ItemsStorage::$namesSeparator or modify existing item names to not contain it.
              SOLUTION
            `);
        }

        children[childrenName] = tree[childrenName].item;
      });

      tree[index].children = children;
    });

    return tree;
  }

  async getDirectChildren(name: string): Promise<Record<string, AccessType>> {
    const rawItems = await this.dataSource
      .createQueryBuilder()
      .select(`${this.tableName}.*`)
      .from(this.tableName, this.tableName)
      .leftJoin(
        this.childrenTableName,
        this.childrenTableName,
        `${this.childrenTableName}.child = ${this.tableName}.name`
      )
      .where('parent = :parent', { name })
      .getRawMany();

    return this.getItemsIndexedByName(rawItems);
  }

  async getAllChildren(names: string | string[]): Promise<Record<string, AccessType>> {
    if (Array.isArray(names) && !names) {
      return {};
    }

    const rawItems = await this.getTreeTraversal().getChildrenRows(names);

    return this.getItemsIndexedByName(rawItems);
  }

  async getAllChildPermissions(names: string | string[]): Promise<Record<string, Permission>> {
    if (Array.isArray(names) && !names) {
      return {};
    }

    const rawItems = await this.getTreeTraversal().getChildPermissionRows(names);

    return this.getItemsIndexedByName(rawItems);
  }

  async getAllChildRoles(names: string | string[]): Promise<Record<string, Role>> {
    if (Array.isArray(names) && !names) {
      return {};
    }

    const rawItems = await this.getTreeTraversal().getChildRoleRows(names);

    return this.getItemsIndexedByName(rawItems);
  }

  async hasChildren(name: string): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .select('1 AS item_child_exists')
      .from(this.childrenTableName, this.childrenTableName)
      .where('parent = :parent', { parent: name })
      .getRawOne();

    return result !== false;
  }

  async hasChild(parentName: string, childName: string): Promise<boolean> {
    const hasChild = await this.getTreeTraversal().hasChild(parentName, childName);

    return hasChild;
  }

  async hasDirectChild(parentName: string, childName: string): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .select('1 AS item_child_exists')
      .from(this.childrenTableName, this.childrenTableName)
      .where('parent = :parent', { parent: parentName })
      .andWhere('child = :child', { child: childName })
      .getRawOne();

    return result !== undefined;
  }

  async addChild(parentName: string, childName: string): Promise<void> {
    await this.singleQuery(`INSERT INTO ${this.childrenTableName} (parent, child) VALUES(?,?)`, [
      parentName,
      childName,
    ]);
  }

  async removeChild(parentName: string, childName: string): Promise<void> {
    await this.singleQuery(`DELETE FROM ${this.childrenTableName} WHERE parent = ? AND child = ?`, [
      parentName,
      childName,
    ]);
  }

  async removeChildren(parentName: string): Promise<void> {
    await this.singleQuery(`DELETE FROM ${this.childrenTableName} WHERE parent = ?`, [parentName]);
  }

  private async getItemsByType(type: TypesItem): Promise<Array<AccessType>> {
    const rawItems: Array<RawItem> = await this.singleQuery(
      `SELECT * FROM ${this.tableName} WHERE type = ?`,
      [type]
    );

    return rawItems.map((item: RawItem): AccessType => this.createItem(item));
  }

  private async getItemByTypeAndName(type: TypesItem, name: string): Promise<AccessType | null> {
    const rawItem: Array<RawItem> = await this.singleQuery(
      `SELECT * FROM ${this.tableName} WHERE type = ? AND name = ?`,
      [type, name]
    );

    return isEmpty(rawItem) ? null : this.createItem(rawItem[0]);
  }

  private createItem(rawItem: RawItem): AccessType {
    return this.factoryItem.create(rawItem);
  }

  private async removeRelatedItemsChildren(queryRunner: QueryRunner, name: string): Promise<void> {
    await this.singleQuery(`DELETE FROM ${this.childrenTableName} WHERE parent = ? OR child = ?`, [
      name,
      name,
    ]);
  }

  private async clearItemsByType(type: string): Promise<void> {
    this.transactional(async (queryRunner: QueryRunner): Promise<void> => {
      let queryParentsSubQuery = '';
      let queryChildrenSubQuery = '';

      const parentsSubQuery: Array<Partial<RawItemChild>> =
        await queryRunner.query(`SELECT parents.parent FROM 
        (SELECT DISTINCT parent FROM ${this.childrenTableName}) as parents 
        LEFT JOIN ${this.tableName} as parent_items ON parent_items,name = parents.parent 
        parent_items.type = ${type}
      `);

      const childrenSubQuery: Array<Partial<RawItemChild>> =
        await queryRunner.query(`SELECT children.child FROM 
        (SELECT DISTINCT child FROM ${this.childrenTableName}) as children 
        LEFT JOIN ${this.tableName} as child_items ON child_items.name = children.child 
        WHERE child_items.type = ${type}
      `);

      parentsSubQuery.forEach((item: Partial<RawItemChild>) => {
        queryParentsSubQuery += `"${item.parent}",`;
      });
      childrenSubQuery.forEach((item: Partial<RawItemChild>) => {
        queryChildrenSubQuery += `"${item.child}",`;
      });

      await queryRunner.query(`DELETE FROM ${this.childrenTableName} 
        WHERE parent IN (${queryParentsSubQuery.slice(
          0,
          -1
        )}) OR child IN (${childrenSubQuery.slice(0, -1)})
      `);

      await queryRunner.query(`DELETE FROM ${this.tableName} WHERE type ${type}`);
    });
  }

  /**
   * Creates RBAC item tree traversal strategy and returns it.
   * In case it was already created, it just retrieves previously saved instance.
   */
  private getTreeTraversal(): ItemTreeTraversal<RawItem> {
    if (this.treeTraversal === null) {
      this.treeTraversal = ItemTreeTraversalFactory.getItemTreeTraversal(
        this.dataSource,
        this.tableName,
        this.childrenTableName,
        this.namesSeparator
      );
    }

    return this.treeTraversal;
  }

  private getItemsIndexedByName(rawItems: RawItem[]): Record<string, AccessType> {
    const items: Record<string, AccessType> = {};

    rawItems.forEach((rawItem) => {
      items[rawItem.name] = this.createItem(rawItem);
    });

    return items;
  }
}
