import { SelectQueryBuilder } from 'typeorm';
import { AssemblerQueryService, Filter, Query, QueryService } from '@owl-app/nestjs-query-core';
import { TypeOrmQueryService } from '@owl-app/nestjs-query-typeorm';
import { instanceOf } from '@owl-app/utils';

import { PaginationConfig } from '../../config/pagination';
import { PaginatedQuery } from '../../pagination/paginated.query';
import { Pagination } from '../../pagination/pagination';

import type { DataProvider, Sort } from '../data.provider';
import { FilterBuilder } from '../filter.builder';
import { QueryFilterBuilder } from './query-filter.builder';

type FilterBuilders<Entity, FiltersData> =
  | FilterBuilder<Filter<Entity>, FiltersData>
  | QueryFilterBuilder<Entity, FiltersData>;

export class PaginatedDataProvider<Entity, FiltersData>
  implements DataProvider<Pagination<Entity>, FiltersData, Entity>
{
  constructor(
    readonly queryService: QueryService<Entity>,
    readonly paginationConfig: PaginationConfig,
    readonly filterBuilder: FilterBuilders<Entity, FiltersData>
  ) {}

  async getData(
    filtersData: FiltersData,
    paginationQuery?: PaginatedQuery,
    defaultSort?: Sort<Entity>
  ): Promise<Pagination<Entity>> {
    const queryService = this.getTypeOrmQueryService();
    const query: Query<Entity> = {};

    if (paginationQuery) {
      query.paging = {
        limit: this.paginationConfig.perPage ?? 10,
        offset: 0,
      };

      if (paginationQuery.page && paginationQuery.page > 0) {
        query.paging.offset = (paginationQuery.page - 1) * paginationQuery.limit;
      }

      if (
        paginationQuery.limit &&
        this.paginationConfig.availablePerPage.indexOf(paginationQuery.limit)
      ) {
        query.paging.limit = paginationQuery.limit;
      }
    }

    if (instanceOf<FilterBuilder<Filter<Entity>, FiltersData>>(this.filterBuilder, 'build')) {
      query.filter = this.filterBuilder.build(filtersData);
    }

    if (instanceOf<QueryFilterBuilder<Entity, FiltersData>>(this.filterBuilder, 'buildRelations')) {
      query.relations = this.filterBuilder.buildRelations(filtersData);
    }

    if (defaultSort) {
      query.sorting = [defaultSort];
    }

    const qb = queryService.filterQueryBuilder.select(query);

    if (instanceOf<QueryFilterBuilder<Entity, FiltersData>>(this.filterBuilder, 'buildCustom')) {
      this.filterBuilder.buildCustom(filtersData, qb);
    }

    const [items, total] = await this.getManyAndCount(qb);

    return { items, metadata: { total } };
  }

  private getTypeOrmQueryService(): TypeOrmQueryService<Entity> {
    let { queryService } = this;

    if (queryService instanceof AssemblerQueryService) {
      queryService = queryService.queryService;
    }

    if (!(queryService instanceof TypeOrmQueryService)) {
      throw new Error('Query service is not instance of TypeOrmQueryService');
    }

    return queryService;
  }

  private getManyAndCount(qb: SelectQueryBuilder<Entity>): Promise<[Entity[], number]> {
    if (this.queryService instanceof AssemblerQueryService) {
      return this.queryService.assembler.convertAsyncToDTOsWithCount(qb.getManyAndCount());
    }

    return qb.getManyAndCount();
  }
}
