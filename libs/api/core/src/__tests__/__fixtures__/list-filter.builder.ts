import { SelectQueryBuilder } from 'typeorm';

import { Filter, SelectRelation } from '@owl-app/nestjs-query-core';

import { QueryFilterBuilder } from '../../data-provider/query/query-filter.builder';

import { FilterBaseEntityDto } from './dto/filter-base-entity.dto';
import { TestBaseEntity } from './test-base.entity';

export class ListFilterBuilder extends QueryFilterBuilder<TestBaseEntity, FilterBaseEntityDto> {
  build(data: FilterBaseEntityDto): Filter<TestBaseEntity> {
    const filters: Filter<TestBaseEntity>[] = [];

    filters.push(this.filterRegistry.get('string').apply(['stringType'], data?.search));

    return {
      or: filters,
    };
  }

  buildCustom(filters: FilterBaseEntityDto, qb: SelectQueryBuilder<TestBaseEntity>): void {
    this.filterCustomRegistry.get('archived').apply(filters, qb);
  }

  buildRelations(): SelectRelation<TestBaseEntity>[] {
    return [{ name: 'tenant', query: {} }];
  }
}
