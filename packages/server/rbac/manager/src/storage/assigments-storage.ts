import { AllItemTypes, Assignment } from '../types';

/**
 * `AssignmentsStorageInterface` represents a storage for assignment of RBAC items (a role or a permission) to a user
 * used in {@see Manager}.
 */
export interface AssignmentsStorage {
  /**
   * Returns all role and permission assignment information.
   *
   * @return array
   * @psalm-return array<string,array<string, Assignment>>
   */
  getAll(): Promise<AllItemTypes>;

  /**
   * Returns all role or permission assignment information for the specified user.
   *
   * @param string userId The user ID.
   *
   * @return Assignment[] The assignments. The array is indexed by the role or the permission names. An empty array
   * will be returned if there is no role or permission assigned to the user.
   */
  getByUserId(userId: string): Promise<Record<string, Assignment>>;

  /**
   * Returns all role or permission assignment information by the specified item names' list.
   *
   * @param string[] $itemNames List of item names.
   *
   * @return Assignment[] The assignments. An empty array will be returned if there are no users assigned to these
   * item names.
   * @psalm-return list<Assignment>
   */
  getByItemNames(itemNames: string[]): Promise<Assignment[]>;

  /**
   * Returns role or permission assignment for the specified item name that belongs to user with the specified ID.
   *
   * @param string itemName Item name.
   * @param string userId The user ID.
   *
   * @return Assignment|null Assignment or null if there is no role or permission assigned to the user.
   */
  get(itemName: string, userId: string): Promise<Assignment | null>;

  /**
   * Whether assignment with a given item name and user id pair exists.
   *
   * @param string $itemName Item name.
   * @param string $userId User id.
   *
   * @return bool Whether assignment exists.
   */
  exists(itemName: string, userId: string): Promise<boolean>;

  /**
   * Whether at least one item from the given list is assigned to the user.
   *
   * @param string $userId User id.
   * @param string[] $itemNames List of item names.
   *
   * @return bool Whether at least one item from the given list is assigned to the user.
   */
  userHasItem(userId: string, $itemNames: string[]): Promise<boolean>;

  /**
   * Filters item names leaving only the ones that are assigned to specific user.
   *
   * @param string $userId User id.
   * @param string[] $itemNames List of item names.
   *
   * @return string[] Filtered item names.
   */
  filterUserItemNames(userId: string, itemNames: string[]): Promise<string[]>;

  /**
   * Adds assignment of the role or permission to the user with ID specified.
   *
   * @param string itemName Item name to assign.
   * @param string userId The user ID.
   */
  add(item_name: string, userId: string): Promise<void>;

  /**
   * Returns whether there is assignment for a named role or permission.
   *
   * @param string name Name of the role or the permission.
   *
   * @return bool Whether there is assignment.
   */
  hasItem(name: string): Promise<boolean>;

  /**
   * Change name of an item in assignments.
   *
   * @param string oldName Old name of the role or the permission.
   * @param string newName New name of the role or permission.
   */
  renameItem(oldName: string, newName: string): void;

  /**
   * Removes assignment of a role or a permission to the user with ID specified.
   *
   * @param string itemName Name of a role or permission to remove assignment from.
   * @param string userId The user ID.
   */
  remove(itemName: string, userId: string): void;

  /**
   * Removes all role or permission assignments for a user with ID specified.
   *
   * @param string userId The user ID.
   */
  removeByUserId(userId: string): void;

  /**
   * Removes all assignments for role or permission.
   *
   * @param string itemName Name of a role or permission to remove.
   */
  removeByItemName(itemName: string): void;

  /**
   * Removes all role and permission assignments.
   */
  clear(): void;
}
