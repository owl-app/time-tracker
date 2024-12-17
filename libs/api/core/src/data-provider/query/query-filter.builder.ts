import { SelectQueryBuilder } from 'typeorm';

import { Registry } from '@owl-app/registry';
import { Filter as FilterQueryService, SelectRelation } from '@owl-app/nestjs-query-core';

import { FilterBuilder } from '../filter.builder';
import { Filter } from '../filtering/filter';
import { FilterCustom } from '../filtering/filter-custom';

export abstract class QueryFilterBuilder<Entity, FilterData>
  implements FilterBuilder<FilterQueryService<Entity>, FilterData>
{
  constructor(
    readonly filterRegistry: Registry<Filter<FilterQueryService<Entity>>>,
    readonly filterCustomRegistry: Registry<FilterCustom<SelectQueryBuilder<Entity>>>
  ) {}

  abstract build(filters: FilterData): FilterQueryService<Entity>;

  buildCustom?(filters: FilterData, qb: SelectQueryBuilder<Entity>): void;

  buildRelations?(filters: FilterData): SelectRelation<Entity>[];
}
