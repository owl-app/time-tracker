import { SelectQueryBuilder } from 'typeorm';

import { Project } from '@owl-app/lib-contracts';

import { QueryFilterBuilder } from '@owl-app/lib-api-core/data-provider/query/query-filter.builder';
import { Filter } from '@owl-app/nestjs-query-core';

import { FilterProjectQuery } from './dto';

export class ListFilterBuilder extends QueryFilterBuilder<Project, FilterProjectQuery> {
  build(data: FilterProjectQuery): Filter<Project> {
    const filters: Filter<Project>[] = [];

    filters.push(this.filterRegistry.get('string').apply(['name'], data?.search));

    if (data?.clients) {
      filters.push({ client: { id: { in: data?.clients?.split(',') } } });
    }

    return {
      and: filters,
    };
  }

  buildCustom(filters: FilterProjectQuery, qb: SelectQueryBuilder<Project>): void {
    this.filterCustomRegistry.get('archived').apply(filters, qb);
  }
}
