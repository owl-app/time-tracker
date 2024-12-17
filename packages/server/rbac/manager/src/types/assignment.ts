/**
 * `Assignment` represents an assignment of a role or a permission to a user.
 */
export class Assignment {
  /**
   * The user ID. This should be a string representing the unique identifier of a user.
   */
  readonly userId: string;

  /**
   * @var string The role or permission name.
   */
  readonly itemName: string;

  /**
   * Representing the assignment creation time.
   */
  readonly createdAt: Date;

  constructor(userId: string, itemName: string, createdAt: Date) {
    this.userId = userId;
    this.itemName = itemName;
    this.createdAt = createdAt;
  }

  getUserId(): string {
    return this.userId;
  }
}
