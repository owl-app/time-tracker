export interface FilterBuilder<Filter, FilterData> {
  build(filters: FilterData): Filter;
}
