import { Repository, SelectQueryBuilder } from 'typeorm';
import { Query } from '@owl-app/nestjs-query-core';
import { FilterQueryBuilder as BaseFilterQueryBuilder } from '@owl-app/nestjs-query-typeorm';
import { Registry } from '@owl-app/registry';

import { FilterQuery } from '../../../registry/interfaces/filter-query';
import { ForceFilters } from '../../core/interfaces/force-filters.interface';

export class FilterQueryBuilder<Entity> extends BaseFilterQueryBuilder<Entity> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(readonly repo: Repository<Entity>, readonly filters?: Registry<FilterQuery<Entity>>) {
    super(repo);
  }

  select(query: Query<Entity>, opts?: ForceFilters): SelectQueryBuilder<Entity> {
    const qb = super.select(query);

    const filters = this.filters?.all();

    if (filters) {
      Object.entries(filters).forEach(([name, filter]) => {
        if (filter.supports(this.repo.metadata) || opts?.forceFilters?.includes(name)) {
          filter.execute(qb);
        }
      });
    }

    return qb;
  }
}
