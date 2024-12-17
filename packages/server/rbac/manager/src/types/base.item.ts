export enum TypesItem {
  ROLE = 'role',
  PERMISSION = 'permission',
}

/**
 * Items are RBAC hierarchy entities that could be assigned to the user.
 * Both roles and permissions are items.
 */
export abstract class Item {
  /**
   * Type of the item.
   */
  abstract readonly type: string;

  /**
   * The name of the item. This must be globally unique.
   */
  readonly name: string;

  /**
   * The item description.
   */
  readonly description: string | null = '';

  /**
   * Name of the rule associated with this item.
   */
  readonly ruleName: string | null = null;

  /**
   * Representing the item creation time.
   */
  private createdDate: Date | null = null;

  /**
   * Representing the item updating time.
   */
  private updatedDate: Date | null = null;

  constructor(
    name: string,
    description: string | null = null,
    ruleName: string | null = null,
    createdDate: Date | null = null,
    updatedDate: Date | null = null
  ) {
    this.name = name;
    this.description = description;
    this.ruleName = ruleName;
    this.createdDate = createdDate;
    this.updatedDate = updatedDate;
  }

  getName(): string {
    return this.name;
  }

  public get createdAt(): Date | null {
    return this.createdDate;
  }

  public set createdAt(createdDate: Date | null) {
    this.createdDate = createdDate;
  }

  public get updatedAt(): Date | null {
    return this.updatedDate;
  }

  public set updatedAt(updatedDate: Date | null) {
    this.updatedDate = updatedDate;
  }

  public hasCreatedAt(): boolean {
    return this.createdDate !== null;
  }

  public hasUpdatedAt(): boolean {
    return this.updatedDate !== null;
  }

  toArray(): [string, string | null, string | null, Date | null, Date | null] {
    return [this.name, this.description, this.ruleName, this.createdDate, this.updatedDate];
  }
}
