import { PaginatedQuery } from '../pagination/paginated.query';

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface Sort<T> {
  /**
   * A field in type T to sort on.
   */
  field: keyof T;
  /**
   * The direction of the sort (ASC or DESC)
   */
  direction: SortDirection;
}

export interface DataProvider<Data, FiltersData, SortData> {
  getData(
    filters: FiltersData,
    paginationQuery?: PaginatedQuery,
    defaultSort?: Sort<SortData>
  ): Promise<Data>;
}
