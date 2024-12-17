import { SelectQueryBuilder } from 'typeorm';

import { Filter } from '@owl-app/nestjs-query-core';

import { Client } from '@owl-app/lib-contracts';

import { QueryFilterBuilder } from '@owl-app/lib-api-core/data-provider/query/query-filter.builder';

import { FilterClientDto } from './dto';

export class ListFilterBuilder extends QueryFilterBuilder<Client, FilterClientDto> {
  build(data: FilterClientDto): Filter<Client> {
    const filters: Filter<Client>[] = [];

    filters.push(this.filterRegistry.get('string').apply(['name'], data?.search));

    return {
      or: filters,
    };
  }

  buildCustom(filters: FilterClientDto, qb: SelectQueryBuilder<Client>): void {
    this.filterCustomRegistry.get('archived').apply(filters, qb);
  }
}
