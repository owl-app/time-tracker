import { Role as BaseRole, Permission as BasePermission } from '../types';

export type CustomFields = { name: string; value: unknown };

/**
 * A storage for RBAC roles and permissions used in {@see Manager}.
 */
export interface ItemsStorage<
  Permission extends BasePermission,
  Role extends BaseRole,
  AccessType = Permission | Role
> {
  /**
   * Removes all roles and permissions.
   */
  clear(): Promise<void>;

  /**
   * Returns all roles and permissions in the system.
   *
   * @return Item[] All roles and permissions in the system.
   */
  getAll(): Promise<Array<AccessType>>;

  /**
   * Returns roles and permission by the given names' list.
   *
   * @param string[] $names List of role and/or permission names.
   *
   * @return array Array of role and permission instances indexed by their corresponding names.
   * @psalm-return ItemsIndexedByName
   */
  getByNames(names: string[]): Promise<Record<string, AccessType>>;

  /**
   * Returns the named role or permission.
   *
   * @param string name The role or the permission name.
   *
   * @return Item|null The role or the permission corresponding to the specified name. `null` is returned if no such
   * item.
   */
  get(name: string): Promise<AccessType | null>;

  /**
   * Returns whether named role or permission exists.
   *
   * @param string name The role or the permission name.
   *
   * @return bool Whether named role or permission exists.
   */
  exists(name: string): Promise<boolean>;

  /**
   * Whether a named role exists.
   *
   * @param string $name The role name.
   *
   * @return bool Whether a named role exists.
   */
  roleExists(name: string): Promise<boolean>;

  /**
   * Adds the role or the permission to RBAC system.
   *
   * @param Permission|Role $item The role or the permission to add.
   */
  add(item: AccessType, customFields: CustomFields[]): Promise<void>;

  /**
   * Updates the specified role or permission in the system.
   *
   * @param string name The old name of the role or permission.
   * @param AccessType item Modified role or permission.
   */
  update(name: string, item: AccessType): Promise<void>;

  /**
   * Removes a role or permission from the RBAC system.
   *
   * @param string name Name of a role or a permission to remove.
   */
  remove(name: string): Promise<void>;

  /**
   * Returns all roles in the system.
   *
   * @return Role[] All roles in the system.
   */
  getRoles(): Promise<Role[]>;

  /**
   * Returns roles by the given names' list.
   *
   * @param string[] $names List of role names.
   *
   * @return Role[] Array of role instances indexed by role names.
   * @psalm-return array<string, Role>
   */
  getRolesByNames(names: string[]): Promise<Record<string, Role>>;

  /**
   * Returns the named role.
   *
   * @param string name The role name.
   *
   * @return Role|null The role corresponding to the specified name. `null` is returned if no such role.
   */
  getRole(name: string): Promise<Role | null>;

  /**
   * Removes all roles.
   * All parent child relations will be adjusted accordingly.
   */
  clearRoles(): Promise<void>;

  /**
   * Returns all permissions in the system.
   *
   * @return Permission[] All permissions in the system.
   */
  getPermissions(): Promise<Permission[]>;

  /**
   * Returns permissions by the given names' list.
   *
   * @param string[] $names List of permission names.
   *
   * @return Permission[] Array of permission instances indexed by permission names.
   * @psalm-return array<string, Permission>
   */
  getPermissionsByNames(names: string[]): Promise<Record<string, Permission>>;

  /**
   * Returns the named permission.
   *
   * @param string name The permission name.
   *
   * @return Permission|null The permission corresponding to the specified name. `null` is returned if no such
   * permission.
   */
  getPermission(name: string): Promise<Permission | null>;

  /**
   * Removes all permissions.
   * All parent child relations will be adjusted accordingly.
   */
  clearPermissions(): Promise<void>;

  /**
   * Returns the parent permissions and/or roles.
   *
   * @param string name The child name.
   *
   * @return Item[] The parent permissions and/or roles.
   */
  getParents(name: string): Promise<Record<string, AccessType>>;

  /**
   * Returns the parents tree for a single item which additionally contains children for each parent (only among the
   * found items). The base item is included too, its children list is always empty.
   *
   * @param string $name The child name.
   *
   * @return array A mapping between parent names and according items with all their children (references to other
   * parents found).
   * @psalm-return Hierarchy
   */
  getHierarchy(
    name: string
  ): Promise<Record<string, { item: AccessType; children: Record<string, AccessType> }>>;

  /**
   * Returns direct child permissions and/or roles.
   *
   * @param string $name The parent name.
   *
   * @return array The child permissions and/or roles.
   * @psalm-return ItemsIndexedByName
   */
  getDirectChildren(name: string): Promise<Record<string, AccessType>>;

  /**
   * Returns all child permissions and/or roles.
   *
   * @param string|string[] $names The parent name / names.
   *
   * @return array The child permissions and/or roles.
   * @psalm-return ItemsIndexedByName
   */
  getAllChildren(names: string | string[]): Promise<Record<string, AccessType>>;

  /**
   * Returns all child roles.
   *
   * @param string|string[] $names The parent name / names.
   *
   * @return Role[] The child roles.
   * @psalm-return array<string, Role>
   */
  getAllChildRoles(names: string | string[]): Promise<Record<string, Role>>;

  /**
   * Returns all child permissions.
   *
   * @param string|string[] $names The parent name / names.
   *
   * @return Permission[] The child permissions.
   * @psalm-return array<string, Permission>
   */
  getAllChildPermissions(names: string | string[]): Promise<Record<string, Permission>>;

  /**
   * Returns whether named parent has children.
   *
   * @param string name The parent name.
   *
   * @return bool Whether named parent has children.
   */
  hasChildren(name: string): Promise<boolean>;

  /**
   * Returns whether selected parent has a child with a given name.
   *
   * @param string $parentName The parent name.
   * @param string $childName The child name.
   *
   * @return bool Whether selected parent has a child with a given name.
   */
  hasChild(parentName: string, childName: string): Promise<boolean>;

  /**
   * Returns whether selected parent has a direct child with a given name.
   *
   * @param string $parentName The parent name.
   * @param string $childName The child name.
   *
   * @return bool Whether selected parent has a direct child with a given name.
   */
  hasDirectChild(parentName: string, childName: string): Promise<boolean>;

  /**
   * Adds a role or a permission as a child of another role or permission.
   *
   * @param string parentName Name of the parent to add child to.
   * @param string childName Name of the child to add.
   */
  addChild(parentName: string, childName: string): Promise<void>;

  /**
   * Removes a child from its parent.
   * Note, the child role or permission is not deleted. Only the parent-child relationship is removed.
   *
   * @param string parentName Name of the parent to remove child from.
   * @param string childName Name of the child to remove.
   */
  removeChild(parentName: string, childName: string): Promise<void>;

  /**
   * Removed all children form their parent.
   * Note, the children roles or permissions are not deleted. Only the parent-child relationships are removed.
   *
   * @param string parentName Name of the parent to remove children from.
   */
  removeChildren(parentName: string): Promise<void>;
}
