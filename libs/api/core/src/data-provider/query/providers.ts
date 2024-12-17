import { SelectQueryBuilder } from 'typeorm';
import { FactoryProvider } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { Registry } from '@owl-app/registry';
import {
  Assembler,
  Class,
  Filter as FilterQueryService,
  getAssemblerQueryServiceToken,
  QueryService,
} from '@owl-app/nestjs-query-core';
import { getQueryServiceToken } from '@owl-app/nestjs-query-typeorm';

import { FilterBuilder } from '../filter.builder';
import { PAGINATION_CONFIG_PROVIDER, PaginationConfig } from '../../config/pagination';
import { Filter } from '../filtering/filter';
import { DATA_PROVIDER_FILTER_REGISTRY, DATA_PROVIDER_FILTER_CUSTOM_REGISTRY } from '../contants';

import { PaginatedDataProvider } from './paginated-query.provider';
import { getPaginatedQueryServiceToken } from './decorators/helpers';
import { FilterCustom } from '../filtering/filter-custom';

export function createPaginatedQueryServiceProvider<Entity>(
  entity: EntityClassOrSchema,
  FilterBuilderClass: Class<FilterBuilder<FilterQueryService<Entity>, unknown>>,
  assembler?: Class<Assembler<unknown, unknown, unknown, unknown, unknown, unknown>>
): FactoryProvider {
  return {
    provide: getPaginatedQueryServiceToken(entity),
    useFactory(
      queryService: QueryService<Entity>,
      paginationConfig: PaginationConfig,
      filterServiceRegistry: Registry<Filter<FilterQueryService<Entity>>>,
      filterCustomServiceRegistry: Registry<FilterCustom<SelectQueryBuilder<Entity>>>
    ) {
      return new PaginatedDataProvider(
        queryService,
        paginationConfig,
        new FilterBuilderClass(filterServiceRegistry, filterCustomServiceRegistry)
      );
    },
    inject: [
      !assembler ? getQueryServiceToken(entity) : getAssemblerQueryServiceToken(assembler),
      PAGINATION_CONFIG_PROVIDER,
      DATA_PROVIDER_FILTER_REGISTRY,
      DATA_PROVIDER_FILTER_CUSTOM_REGISTRY,
    ],
  };
}
