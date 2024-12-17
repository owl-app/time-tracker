/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Query } from '@owl-app/nestjs-query-core';
import { RelationQueryBuilder as BaseRelationqueryBuilder } from '@owl-app/nestjs-query-typeorm';
import { Registry } from '@owl-app/registry';

import { FilterQuery } from '../../../registry/interfaces/filter-query';

import { FilterQueryBuilder } from './filter-query.builder';

export class RelationQueryBuilder<Entity, Relation> extends BaseRelationqueryBuilder<
  Entity,
  Relation
> {
  constructor(
    readonly repo: Repository<Entity>,
    readonly relation: string,
    readonly filters?: Registry<FilterQuery<Relation>>
  ) {
    super(repo, relation);
    const filterQueryBuilder = new FilterQueryBuilder<Relation>(this.relationRepo, filters);
    this.filterQueryBuilder = filterQueryBuilder;
  }

  public select(entity: Entity, query: Query<Relation>): SelectQueryBuilder<Relation> {
    const qb = super.select(entity, query);

    const filters = this.filters?.all();

    if (filters) {
      Object.entries(filters).forEach((filter) => {
        if (filter[1].supports(this.repo.metadata)) {
          filter[1].execute(qb);
        }
      });
    }

    return qb;
  }
}
