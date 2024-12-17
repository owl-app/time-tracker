import { SelectQueryBuilder } from 'typeorm';

import { Tag } from '@owl-app/lib-contracts';
import { QueryFilterBuilder } from '@owl-app/lib-api-core/data-provider/query/query-filter.builder';
import { Filter } from '@owl-app/nestjs-query-core';

import { FilterTagDto } from './dto';

export class ListFilterBuilder extends QueryFilterBuilder<Tag, FilterTagDto> {
  build(data: FilterTagDto): Filter<Tag> {
    const filters: Filter<Tag>[] = [];

    filters.push(this.filterRegistry.get('string').apply(['name'], data?.search));

    return {
      or: filters,
    };
  }

  buildCustom(filters: FilterTagDto, qb: SelectQueryBuilder<Tag>): void {
    this.filterCustomRegistry.get('archived').apply(filters, qb);
  }
}
