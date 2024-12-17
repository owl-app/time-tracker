import { Hierarchy } from '../types';

/**
 * An interface for retrieving hierarchical RBAC items' data in a more efficient way depending on used RDBMS and their
 * versions.
 */
export interface ItemTreeTraversal<RawItem> {
  /**
   * Get all parent rows for an item by the given name.
   *
   * @param string $name Item name.
   *
   * @return array Flat list of all parents.
   *
   * @return RawItem[]
   */
  getParentRows(name: string): Promise<RawItem[]>;

  /**
   * Returns the parents tree for a single item which additionally contains children for each parent (only among the
   * found items). The base item is included too, its children list is always empty.
   *
   * @param string $name The child name.
   *
   * @return Hierarchy
   */
  getHierarchy(name: string): Promise<Hierarchy>;

  /**
   * Get all children rows for an item by the given name.
   *
   * @param string|string[] $names Item name / names.
   *
   * @param string|non-empty-array<array-key, string> $names
   *
   * @return array Flat list of all children.
   *
   * @return RawItem[]
   */
  getChildrenRows(names: string | string[]): Promise<RawItem[]>;

  /**
   * Get all child permission rows for an item by the given name.
   *
   * @param string|string[] $names Item name / names.
   *
   * @param string|non-empty-array<array-key, string> $names
   *
   * @return array Flat list of all child permissions.
   *
   * @return RawItem[]
   */
  getChildPermissionRows(names: string | string[]): Promise<RawItem[]>;

  /**
   * Get all child role rows for an item by the given name.
   *
   * @param string|string[] $names Item name / names.
   *
   * @param string|non-empty-array<array-key, string> $names
   *
   * @return array Flat list of all child roles.
   *
   * @return RawItem[]
   */
  getChildRoleRows(names: string | string[]): Promise<RawItem[]>;

  /**
   * Whether a selected parent has a specific child.
   *
   * @param string $parentName Parent item name.
   * @param string $childName Child item name.
   *
   * @return bool Whether a selected parent has a specific child.
   */
  hasChild(parentName: string, childName: string): Promise<boolean>;
}
