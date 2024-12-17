export interface FilterCustom<QueryBuilder> {
  apply<QueryData>(data: QueryData, qb: QueryBuilder): void;
}
