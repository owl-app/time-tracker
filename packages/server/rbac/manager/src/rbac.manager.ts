import { Registry } from '@owl-app/registry';

import { ItemsStorage, AssignmentsStorage, CustomFields } from './storage';

import {
  Item,
  Permission as BasePermission,
  Role as BaseRole,
  Assignment,
  AccessType,
  Rule,
  Permission,
  Role,
} from './types';
import { ItemAlreadyExistsException } from './exceptions/item-alredy-exists.exception';
import { RuntimeException } from './exceptions/runtime.exception';

export class RbacManager<Permission extends BasePermission, Role extends BaseRole> {
  private defaultRoleNames: string[] = [];

  private guestRoleName: string | null = null;

  constructor(
    readonly itemsStorage: ItemsStorage<Permission, Role>,
    readonly assignmentsStorage: AssignmentsStorage,
    readonly serviceRegistryRules: Registry<Rule>,
    readonly enableDirectPermissions = false,
    readonly includeRolesInAccessChecks = false
  ) {}

  async userHasPermission(
    userId: string | number | null,
    permissionName: string,
    parameters: Record<string, unknown> = {}
  ): Promise<boolean> {
    const item = await this.itemsStorage.get(permissionName);
    if (!item) return false;

    if (!this.includeRolesInAccessChecks && item.type === 'role') return false;

    const guestRole = userId === null ? await this.getGuestRole() : null;
    if (userId === null && guestRole === null) return false;

    const hierarchy = await this.itemsStorage.getHierarchy(item.getName());
    const hierarchyValues = Object.values(hierarchy);

    const itemNames: string[] = [];

    Object.values(hierarchy).forEach(
      (treeItem: { item: AccessType; children: Record<string, AccessType> }) => {
        itemNames.push(treeItem.item.getName());
      }
    );

    const userItemNames = guestRole
      ? [guestRole.getName()]
      : await this.filterUserItemNames(String(userId), itemNames);

    const userItemNamesMap: Record<string, null> = {};

    userItemNames.forEach((userItemName) => {
      userItemNamesMap[userItemName] = null;
    });

    for (let i = 0; i <= hierarchyValues.length; i += 1) {
      if (
        !(hierarchyValues[i].item.getName() in userItemNamesMap) ||
        !this.executeRule(userId ? String(userId) : null, hierarchyValues[i].item, parameters)
      ) {
        // eslint-disable-next-line no-continue
        continue;
      }

      let hasPermission = true;

      // eslint-disable-next-line no-restricted-syntax
      for (const childItem of Object.values(hierarchyValues[i].children)) {
        if (!this.executeRule(userId ? String(userId) : null, childItem, parameters)) {
          hasPermission = false;
          break;
        }
      }

      if (hasPermission) {
        return true;
      }
    }

    return false;
  }

  async canAddChild(parentName: string, childName: string): Promise<boolean> {
    try {
      await this.assertFutureChild(parentName, childName);
    } catch {
      return false;
    }
    return true;
  }

  async addChild(parentName: string, childName: string): Promise<this> {
    await this.assertFutureChild(parentName, childName);
    await this.itemsStorage.addChild(parentName, childName);

    return this;
  }

  async removeChild(parentName: string, childName: string): Promise<this> {
    await this.itemsStorage.removeChild(parentName, childName);
    return this;
  }

  async removeChildren(parentName: string): Promise<this> {
    this.itemsStorage.removeChildren(parentName);
    return this;
  }

  async hasChild(parentName: string, childName: string): Promise<boolean> {
    return this.itemsStorage.hasDirectChild(parentName, childName);
  }

  async hasChildren(parentName: string): Promise<boolean> {
    return this.itemsStorage.hasChildren(parentName);
  }

  async assign(itemName: string, userId: string | number, createdAt?: Date): Promise<this> {
    const parsedUserId = String(userId);

    const item = await this.itemsStorage.get(itemName);
    if (!item) throw new Error(`There is no item named "${itemName}".`);

    if (!this.enableDirectPermissions && item.type === 'permission') {
      throw new Error('Assigning permissions directly is disabled. Prefer assigning roles only.');
    }

    if (this.assignmentsStorage.exists(itemName, parsedUserId)) return this;

    const assignment = new Assignment(
      parsedUserId,
      itemName,
      createdAt instanceof Date ? createdAt : new Date()
    );
    this.assignmentsStorage.add(assignment.itemName, assignment.getUserId());

    return this;
  }

  async revoke(itemName: string, userId: string | number): Promise<this> {
    await this.assignmentsStorage.remove(itemName, String(userId));
    return this;
  }

  async revokeAll(userId: string | number): Promise<this> {
    await this.assignmentsStorage.removeByUserId(String(userId));
    return this;
  }

  async getItemsByUserId(userId: string | number): Promise<Item[]> {
    const parsedUserId = String(userId);
    const assignments = await this.assignmentsStorage.getByUserId(parsedUserId);
    const assignmentNames = Object.keys(assignments);

    return [
      ...Object.values(this.getDefaultRoles()),
      ...Object.values(await this.itemsStorage.getByNames(assignmentNames)),
      ...Object.values(await this.itemsStorage.getAllChildren(assignmentNames)),
    ];
  }

  async getRolesByUserId(userId: string | number): Promise<Role[]> {
    const parsedUserId = String(userId);
    const assignments = await this.assignmentsStorage.getByUserId(parsedUserId);
    const assignmentNames = Object.keys(assignments);

    return [
      ...Object.values(this.getDefaultRoles()),
      ...Object.values(await this.itemsStorage.getRolesByNames(assignmentNames)),
      ...Object.values(await this.itemsStorage.getAllChildRoles(assignmentNames)),
    ];
  }

  async getChildRoles(roleName: string): Promise<Record<string, Role>> {
    if (!this.itemsStorage.roleExists(roleName)) {
      throw new Error(`Role "${roleName}" not found.`);
    }

    const allChildRoles = await this.itemsStorage.getAllChildRoles(roleName);

    return allChildRoles;
  }

  async getPermissionsByRoleName(roleName: string): Promise<Record<string, Permission>> {
    const allChildPermissions = await this.itemsStorage.getAllChildPermissions(roleName);

    return allChildPermissions;
  }

  async getPermissionsByUserId(userId: string | number): Promise<Permission[]> {
    const parsedUserId = String(userId);
    const assignments = await this.assignmentsStorage.getByUserId(parsedUserId);
    if (Object.keys(assignments).length === 0) return [];

    const assignmentNames = Object.keys(assignments);

    return [
      ...Object.values(await this.itemsStorage.getPermissionsByNames(assignmentNames)),
      ...Object.values(await this.itemsStorage.getAllChildPermissions(assignmentNames)),
    ];
  }

  async getUserIdsByRoleName(roleName: string): Promise<string[]> {
    const roleNames = [roleName, ...Object.keys(await this.itemsStorage.getParents(roleName))];

    const assigments = await this.assignmentsStorage.getByItemNames(roleNames);

    return assigments.map((assignment) => assignment.getUserId());
  }

  async addRole(role: Role): Promise<this> {
    await this.addItem(role);

    return this;
  }

  async getRole(name: string): Promise<Role | null> {
    const role = await this.itemsStorage.getRole(name);

    return role;
  }

  async updateRole(name: string, role: Role): Promise<this> {
    await this.assertItemNameForUpdate(role, name);
    await this.itemsStorage.update(name, role);
    await this.assignmentsStorage.renameItem(name, role.getName());

    return this;
  }

  async removeRole(name: string): Promise<this> {
    await this.removeItem(name);

    return this;
  }

  async addPermission(permission: Permission, customField?: CustomFields[]): Promise<this> {
    await this.addItem(permission, customField);

    return this;
  }

  async getPermission(name: string): Promise<Permission | null> {
    const permission = this.itemsStorage.getPermission(name);

    return permission;
  }

  async updatePermission(name: string, permission: Permission): Promise<this> {
    await this.assertItemNameForUpdate(permission, name);
    await this.itemsStorage.update(name, permission);
    await this.assignmentsStorage.renameItem(name, permission.getName());

    return this;
  }

  async removePermission(name: string): Promise<this> {
    await this.removeItem(name);

    return this;
  }

  setDefaultRoleNames(roleNames: string[] | (() => string[])): this {
    this.defaultRoleNames = Array.isArray(roleNames) ? roleNames : roleNames();

    return this;
  }

  getDefaultRoleNames(): string[] {
    return this.defaultRoleNames;
  }

  setGuestRoleName(name: string | null): this {
    this.guestRoleName = name;
    return this;
  }

  getGuestRoleName(): string | null {
    return this.guestRoleName;
  }

  async getGuestRole(): Promise<Role | null> {
    if (!this.guestRoleName) return null;

    const role = await this.getRole(this.guestRoleName);

    return role;
  }

  private async addItem(item: Role | Permission, customField?: CustomFields[]): Promise<void> {
    if (await this.itemsStorage.exists(item.getName())) {
      throw new ItemAlreadyExistsException(item);
    }

    await this.itemsStorage.add(item, customField);
  }

  private async removeItem(name: string): Promise<void> {
    if (!(await this.itemsStorage.exists(name))) {
      return;
    }

    await this.itemsStorage.remove(name);
    await this.assignmentsStorage.removeByItemName(name);
  }

  private async assertItemNameForUpdate(item: Role | Permission, oldName: string): Promise<void> {
    if (item.getName() === oldName) {
      return;
    }

    if (await this.itemsStorage.exists(item.getName())) {
      throw new ItemAlreadyExistsException(item);
    }
  }

  async assertFutureChild(parentName: string, childName: string): Promise<void> {
    if (parentName === childName) {
      throw new RuntimeException('Cannot add "$parentName" as a child of itself.');
    }

    const parent = await this.itemsStorage.get(parentName);

    if (parent === null) {
      throw new RuntimeException(`Parent ${parentName} does not exist.`);
    }

    const child = await this.itemsStorage.get(childName);

    if (child === null) {
      throw new RuntimeException(`Child ${childName} does not exist.`);
    }

    if (parent instanceof Permission && child instanceof Role) {
      throw new RuntimeException(
        `Can not add ${childName} role as a child of ${parentName} permission.`
      );
    }

    if (await this.itemsStorage.hasDirectChild(parentName, childName)) {
      throw new RuntimeException(`The item ${parentName} already has a child ${childName}.`);
    }

    if (await this.itemsStorage.hasChild(childName, parentName)) {
      throw new RuntimeException(
        `Cannot add ${childName} as a child of ${parentName}. A loop has been detected.`
      );
    }
  }

  private executeRule(user: string, item: Item, params: Record<string, unknown>): boolean {
    if (
      item.ruleName === null ||
      item.ruleName === null ||
      !this.serviceRegistryRules.has(item.ruleName)
    ) {
      return true;
    }

    return this.serviceRegistryRules.get(item.ruleName).execute(user, item, params);
  }

  private async getDefaultRoles(): Promise<Record<string, Role | null>> {
    if (this.defaultRoleNames.length === 0) return null;

    const roles = await this.itemsStorage.getRolesByNames(this.defaultRoleNames);

    return roles;
  }

  async filterUserItemNames(userId: string, itemNames: string[]): Promise<string[]> {
    const filterUserItemNames = await this.assignmentsStorage.filterUserItemNames(
      userId,
      itemNames
    );

    return [...filterUserItemNames, ...this.defaultRoleNames];
  }
}
