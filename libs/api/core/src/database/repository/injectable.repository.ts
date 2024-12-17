import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DeepPartial,
  EntityManager,
  EntityTarget,
  QueryRunner,
  SaveOptions,
  SelectQueryBuilder,
} from 'typeorm';
import { cloneDeep } from 'lodash';

import { Registry } from '@owl-app/registry';

import { FilterQuery } from '../../registry/interfaces/filter-query';
import { EntitySetter } from '../../registry/interfaces/entity-setter';

import { BaseRepository } from './base.repository';
import BaseEntity from '../entity/base.entity';

function extendEntityManager<Entity>(
  manager: EntityManager,
  filters?: Registry<FilterQuery<Entity>>
) {
  return (
    entityClass?: EntityTarget<Entity>,
    alias?: string,
    queryRunner?: QueryRunner
  ): SelectQueryBuilder<Entity> => {
    const qb = manager.createQueryBuilder<Entity>(entityClass, alias, queryRunner);

    if (alias) {
      const allFilters = filters?.all();

      if (allFilters) {
        Object.entries(allFilters).forEach((filter) => {
          if (filter[1].supports(manager.connection.getMetadata(entityClass))) {
            filter[1].execute(qb);
          }
        });
      }
    }

    return qb;
  };
}

export class InjectableRepository<Entity extends BaseEntity> extends BaseRepository<Entity> {
  constructor(
    target: EntityTarget<Entity>,
    manager: EntityManager,
    queryRunner?: QueryRunner,
    readonly filters?: Registry<FilterQuery<Entity>>,
    readonly setters?: Registry<EntitySetter<Entity>>,
    readonly eventEmitter?: EventEmitter2
  ) {
    super(
      target,
      // replace createQueryBuilder with extended version
      Object.assign(cloneDeep(manager), manager, {
        createQueryBuilder: extendEntityManager<Entity>(
          {
            ...manager,
            createQueryBuilder: manager.createQueryBuilder,
          } as EntityManager,
          filters
        ),
      }),
      queryRunner,
      eventEmitter
    );
  }

  /**
   * Saves all given entities in the database.
   * If entities do not exist in the database then inserts, otherwise updates.
   */
  override save<T extends DeepPartial<Entity>>(
    entities: T[],
    options: SaveOptions & { reload: false }
  ): Promise<T[]>;

  /**
   * Saves all given entities in the database.
   * If entities do not exist in the database then inserts, otherwise updates.
   */
  override save<T extends DeepPartial<Entity>>(
    entities: T[],
    options?: SaveOptions
  ): Promise<(T & Entity)[]>;

  /**
   * Saves a given entity in the database.
   * If entity does not exist in the database then inserts, otherwise updates.
   */
  override save<T extends DeepPartial<Entity>>(
    entity: T,
    options: SaveOptions & { reload: false }
  ): Promise<T>;

  /**
   * Saves a given entity in the database.
   * If entity does not exist in the database then inserts, otherwise updates.
   */
  override save<T extends DeepPartial<Entity>>(
    entity: T,
    options?: SaveOptions
  ): Promise<T & Entity>;

  /**
   * Saves one or many given entities.
   */
  override save<T extends DeepPartial<Entity>>(
    entityOrEntities: T | T[],
    options?: SaveOptions
  ): Promise<T | T[]> {
    const setters = this.setters?.all();

    if (setters) {
      Object.entries(setters).forEach((filter) => {
        if (filter[1].supports(this.metadata)) {
          filter[1].execute(entityOrEntities);
        }
      });
    }

    return super.save(entityOrEntities as DeepPartial<Entity>, options) as Promise<T | T[]>;
  }
}
