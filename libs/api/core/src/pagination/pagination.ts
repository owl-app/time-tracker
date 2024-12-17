export interface PaginationMetadata {
  total: number;
}
export interface Pagination<T> {
  /**
   * Items included in the current listing
   */
  readonly items: readonly T[];

  /**
   * Total number of available items
   */
  readonly metadata: PaginationMetadata;
}

export class Paginated<T> implements Pagination<T> {
  readonly metadata: PaginationMetadata;

  readonly items: readonly T[];

  constructor(props: Paginated<T>) {
    this.metadata = props.metadata;
    this.items = props.items;
  }
}
