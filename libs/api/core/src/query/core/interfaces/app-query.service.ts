import { DeepPartial, QueryService, Filter, Query } from '@owl-app/nestjs-query-core';
import { QueryOptions } from './query-options';

/**
 * Base interface for all QueryServices.
 *
 * @typeparam T - The record type that the query service will operate on.
 */
export interface AppQueryService<DTO, C = DeepPartial<DTO>, U = DeepPartial<DTO>>
  extends QueryService<DTO, C, U> {
  query(query: Query<DTO>, opts?: QueryOptions): Promise<DTO[]>;

  createWithRelations(item: C, filter?: Filter<DTO>, opts?: QueryOptions): Promise<DTO>;

  updateWithRelations(
    id: number | string | Filter<DTO>,
    update: U,
    opts?: QueryOptions
  ): Promise<DTO>;
}
