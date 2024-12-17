export interface Filter<FilterData> {
  apply<QueryData, Options>(fields: string[], data: QueryData, options?: Options): FilterData;
}
