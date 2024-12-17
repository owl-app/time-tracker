import { QueryOptions as BaseQueryOptions } from '@owl-app/nestjs-query-core';
import { ForceFilters } from './force-filters.interface';

export interface QueryOptions extends BaseQueryOptions, ForceFilters {}
