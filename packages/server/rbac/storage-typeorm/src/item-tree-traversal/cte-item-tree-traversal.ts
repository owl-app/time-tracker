import { DataSource, SelectQueryBuilder } from 'typeorm';

import { TypesItem } from '@owl-app/rbac-manager';

import { BaseStorage } from '../base.storage';
import { Hierarchy } from '../types';
import { ItemTreeTraversal } from './item-tree-traversal';

/**
 * A RBAC item tree traversal strategy based on CTE (common table expression). Uses `WITH` expression to form a
 * recursive query. The base queries are unified as much as possible to work for all RDBMS supported by Yii Database
 * with minimal differences.
 *
 * @internal
 *
 * @phpstan-import-type RawItem from ItemsStorage
 * @phpstan-import-type Hierarchy from ItemTreeTraversalInterface
 */
export abstract class CteItemTreeTraversal<RawItem>
  extends BaseStorage
  implements ItemTreeTraversal<RawItem>
{
  readonly childrenTableName: string | null;

  constructor(
    readonly dataSource: DataSource,
    readonly tableName: string,
    childrenTableName: string,
    readonly namesSeparator: string
  ) {
    super(dataSource);
    this.childrenTableName = childrenTableName ?? `${tableName}_child`;
  }

  async getParentRows(name: string): Promise<RawItem[]> {
    const queryBuilder = this.dataSource.createQueryBuilder();

    const baseOuterQueryBuilder = queryBuilder
      .select('item.*')
      .where('item.name != :name', { name });

    const result = await this.getRowsStatement(name, baseOuterQueryBuilder);

    return result;
  }

  async getHierarchy(name: string): Promise<Hierarchy> {
    let queryBuilder = this.dataSource.createQueryBuilder();
    const baseOuterQueryBuilder = queryBuilder.select(['item.*', 'parent_of.children']);

    queryBuilder = this.dataSource.createQueryBuilder();
    const cteSelectItemQuery = queryBuilder
      .select(['name', this.getEmptyChildrenExpression()])
      .from(this.tableName, this.tableName)
      .where('name = :cteSelectItemQueryName', { cteSelectItemQueryName: name });

    queryBuilder = this.dataSource.createQueryBuilder();
    const cteSelectRelationQuery = queryBuilder
      .select(['parent', this.getTrimConcatChildrenExpression()])
      .from(this.childrenTableName, 'item_child_recursive')
      .innerJoin('parent_of', 'parent_of', 'item_child_recursive.child = parent_of.child_name');

    queryBuilder = this.dataSource.createQueryBuilder();
    const outerQuery = baseOuterQueryBuilder
      .from('parent_of', 'parent_of')
      .leftJoin(this.tableName, 'item', 'item.name = parent_of.child_name');

    const sql = `${this.getWithExpression()} parent_of(child_name, children) AS (
          ${cteSelectItemQuery}
          UNION ALL
          ${cteSelectRelationQuery}
        )
        ${outerQuery}`;

    const result = await this.singleQuery(sql, [
      ...Object.values(outerQuery.getParameters()).map((parameter) => parameter),
      ...Object.values(cteSelectItemQuery.getParameters()).map((parameter) => parameter),
    ]);

    return result;
  }

  async getChildrenRows(names: string | string[]): Promise<RawItem[]> {
    const baseOuterQueryBuilder = this.getChildrenBaseOuterQuery(names);

    const result = await this.getRowsStatement(names, baseOuterQueryBuilder, false);

    return result;
  }

  async getChildPermissionRows(names: string | string[]): Promise<RawItem[]> {
    const baseOuterQueryBuilder = this.getChildrenBaseOuterQuery(names);
    baseOuterQueryBuilder.andWhere('item.type = :type', { type: TypesItem.PERMISSION });

    return this.getRowsStatement(names, baseOuterQueryBuilder, false);
  }

  async getChildRoleRows(names: string | string[]): Promise<RawItem[]> {
    const baseOuterQueryBuilder = this.getChildrenBaseOuterQuery(names);
    baseOuterQueryBuilder.andWhere('item.type = :type', { type: TypesItem.ROLE });

    return this.getRowsStatement(names, baseOuterQueryBuilder, false);
  }

  async hasChild(parentName: string, childName: string): Promise<boolean> {
    const queryBuilder = this.dataSource.createQueryBuilder();

    const baseOuterQueryBuilder = queryBuilder.andWhere('item.name = :childName', { childName });

    const result = await this.getRowsStatement(parentName, baseOuterQueryBuilder, false);

    return result.length > 0;
  }

  /**
   * @infection-ignore-all
   *  - ProtectedVisibility.
   *
   * @return non-empty-string
   */
  protected getEmptyChildrenExpression(): string {
    return "''";
  }

  /**
   * @return non-empty-string
   */
  protected getTrimConcatChildrenExpression(): string {
    return `TRIM('${this.namesSeparator}' FROM CONCAT(children, '${this.namesSeparator}', item_child_recursive.child))`;
  }

  private async getRowsStatement(
    names: string | string[],
    baseOuterQueryBuilder: SelectQueryBuilder<RawItem>,
    areParents = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    let cteSelectRelationName = '';
    let cteConditionRelationName = 'child';
    let cteName = 'parent_of';
    let cteParameterName = 'child_name';

    if (areParents) {
      cteSelectRelationName = 'parent';
      cteConditionRelationName = 'child';
      cteName = 'parent_of';
      cteParameterName = 'child_name';
    } else {
      cteSelectRelationName = 'child';
      cteConditionRelationName = 'parent';
      cteName = 'child_of';
      cteParameterName = 'parent_name';
    }

    let queryBuilder = this.dataSource.createQueryBuilder();

    let cteSelectItemQuery = queryBuilder.select('name').from(this.tableName, this.tableName);

    if (Array.isArray(names)) {
      cteSelectItemQuery = cteSelectItemQuery.where('name IN (:...names)', { names });
    } else {
      cteSelectItemQuery = cteSelectItemQuery.where('name = :name', { name: names });
    }

    queryBuilder = this.dataSource.createQueryBuilder();

    const cteSelectRelationQuery = queryBuilder
      .select(cteSelectRelationName)
      .from(this.childrenTableName, 'item_child_recursive')
      .innerJoin(
        cteName,
        cteName,
        `item_child_recursive.${cteConditionRelationName} = ${cteName}.${cteParameterName}`
      );

    queryBuilder = this.dataSource.createQueryBuilder();

    const outerQuery = baseOuterQueryBuilder
      .from(cteName, cteName)
      .leftJoin(this.tableName, 'item', `item.name = ${cteName}.${cteParameterName}`);

    const sql = `${this.getWithExpression()} ${cteName}(${cteParameterName}) AS (
            ${cteSelectItemQuery.getSql()}
            UNION ALL
            ${cteSelectRelationQuery.getSql()}
          )
          ${outerQuery.getSql()}`;

    const parameters: string[] = [];

    Object.values(cteSelectItemQuery.getParameters()).forEach((parameter) =>
      parameters.push(parameter)
    );
    Object.values(cteSelectRelationQuery.getParameters()).forEach((parameter) =>
      parameters.push(parameter)
    );
    Object.values(outerQuery.getParameters()).forEach((parameter) => parameters.push(parameter));

    const result = await this.singleQuery(sql, parameters);

    return result;
  }

  /**
   * @param string|non-empty-array<array-key, string> $names
   */
  private getChildrenBaseOuterQuery(names: string | string[]): SelectQueryBuilder<RawItem> {
    const queryBuilder = this.dataSource.createQueryBuilder();
    const baseOuterQuery = queryBuilder.select('item.*').distinct();

    if (!Array.isArray(names)) {
      return baseOuterQuery.where('item.name != :name', { name: names });
    }

    const result = baseOuterQuery.where('item.name NOT IN (:...names)', { names });

    return result;
  }

  /**
   * Gets `WITH` expression used in a DB query.
   *
   * @infection-ignore-all
   * - ProtectedVisibility.
   *
   * @return string `WITH` expression.
   */
  protected getWithExpression(): string {
    return 'WITH RECURSIVE';
  }
}
