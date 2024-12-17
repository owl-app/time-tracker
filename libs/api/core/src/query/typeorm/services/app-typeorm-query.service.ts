import { Repository } from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { cloneDeep, omit } from 'lodash';
import { NotFoundException } from '@nestjs/common';

import { TypeOrmQueryService, TypeOrmQueryServiceOpts } from '@owl-app/nestjs-query-typeorm';
import {
  DeepPartial,
  UpdateOneOptions,
  Filter,
  WithDeleted,
  FilterComparisons,
  Query,
} from '@owl-app/nestjs-query-core';
import { convertToSnakeCase } from '@owl-app/utils';
import { Registry } from '@owl-app/registry';

import { DomainEvent } from '../../../event/domain-event.base';
import { FilterQueryBuilder } from '../query/filter-query.builder';
import { FilterQuery } from '../../../registry/interfaces/filter-query';
import { RelationQueryBuilder } from '../query/relation-query.builder';
import { EntitySetter } from '../../../registry/interfaces/entity-setter';
import { TransactionalRepository } from '../../../database/repository/transactional.repository';
import DomainEventableEntity from '../../../database/entity/domain-eventable.entity';
import { AppQueryService } from '../../core/interfaces/app-query.service';

import { QueryOptions } from '../../core/interfaces/query-options';

export interface AppTypeOrmQueryServiceOpts<Entity> extends TypeOrmQueryServiceOpts<Entity> {
  useTransaction?: boolean;
}

export class AppTypeOrmQueryService<Entity extends DomainEventableEntity>
  extends TypeOrmQueryService<Entity>
  implements AppQueryService<Entity>
{
  readonly filterQueryBuilder: FilterQueryBuilder<Entity>;

  readonly useTransaction: boolean;

  readonly events = {
    EVENT_CREATED: 'CREATED',
    EVENT_UPDATED: 'UPDATED',
    EVENT_DELETED: 'DELETED',
  };

  constructor(
    readonly repo: Repository<Entity>,
    opts?: AppTypeOrmQueryServiceOpts<Entity>,
    readonly filters?: Registry<FilterQuery<Entity>>,
    readonly setters?: Registry<EntitySetter<DeepPartial<Entity>>>
  ) {
    opts.filterQueryBuilder = new FilterQueryBuilder<Entity>(repo, filters);
    super(repo, opts);
    this.useTransaction = opts?.useTransaction ?? true;
  }

  public getRelationQueryBuilder<Relation>(name: string): RelationQueryBuilder<Entity, Relation> {
    return new RelationQueryBuilder(
      this.repo,
      name,
      this.filters as unknown as Registry<FilterQuery<Relation>>
    );
  }

  public async query(query: Query<Entity>, opts?: QueryOptions): Promise<Entity[]> {
    const qb = this.filterQueryBuilder.select(query, opts);

    if (opts?.withDeleted) {
      qb.withDeleted();
    }

    return qb.getMany();
  }

  async findByFilter(filter: Filter<Entity>, opts?: WithDeleted): Promise<Entity> {
    const qb = this.filterQueryBuilder.select({ filter });

    if (opts?.withDeleted) {
      qb.withDeleted();
    }

    const entity = await qb.getOne();

    if (!entity) {
      throw new NotFoundException('Entity not found');
    }

    return entity;
  }

  public async createOne(record: DeepPartial<Entity>): Promise<Entity> {
    this.injectSetters(record);

    const entity = (await this.ensureIsEntityAndDoesNotExist(record)) as Entity;

    if (record instanceof DomainEventableEntity) {
      this.createEvent(this.events.EVENT_CREATED, entity);
    }

    if (this.useTransaction) {
      if (this.repo instanceof TransactionalRepository) {
        const result = await this.repo.transaction(async () => this.repo.save(entity));
        return result;
      }

      throw new Error('Repository should extend by TransactionalRepository');
    }

    return this.repo.save(entity);
  }

  public async updateOne(
    id: number | string,
    update: DeepPartial<Entity>,
    opts?: UpdateOneOptions<Entity>
  ): Promise<Entity> {
    this.ensureIdIsNotPresent(update);

    this.injectSetters(update);

    const entity = await this.getById(id, opts);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.repo.merge(entity, update);

    if (update instanceof DomainEventableEntity) {
      this.createEvent(this.events.EVENT_UPDATED, entity);
    }

    if (this.useTransaction) {
      if (this.repo instanceof TransactionalRepository) {
        const result = await this.repo.transaction(async () => this.repo.save(entity));

        return result;
      }

      throw new Error('Repository should extend by TransactionalRepository');
    }

    return this.repo.save(entity);
  }

  public async createWithRelations(
    record: DeepPartial<Entity>,
    filters?: Filter<Entity>,
    opts?: QueryOptions
  ): Promise<Entity> {
    const entity = this.repo.create({} as Entity);

    this.copyRegularColumn(entity, record);
    this.injectSetters(entity as DeepPartial<Entity>);

    if (filters) {
      await this.ensureEntityDoesNotExistByFilter(filters, opts);
    } else {
      await this.ensureEntityDoesNotExist(entity);
    }

    if (record instanceof DomainEventableEntity) {
      this.createEvent(this.events.EVENT_CREATED, entity);
    }

    if (this.useTransaction) {
      if (this.repo instanceof TransactionalRepository) {
        const result = await this.repo.transaction(async () => {
          await Promise.all(
            this.repo.metadata.relations.map(async (relation) =>
              this.assingRelations(entity, record, relation)
            )
          ).then(() => entity);

          return this.repo.save(entity);
        });

        return result;
      }

      throw new Error('Repository should extend by TransactionalRepository');
    }

    return this.repo.save(entity);
  }

  public async updateWithRelations(
    id: number | string | Filter<Entity>,
    update: DeepPartial<Entity>,
    opts?: QueryOptions
  ): Promise<Entity> {
    this.ensureIdIsNotPresent(update);
    let entity: Entity = null;

    if (typeof id === 'object') {
      entity = (await this.query({ filter: id }, opts))?.[0];
    } else {
      entity = await this.getById(id, opts);
    }

    this.copyRegularColumn(entity, update);

    if (update instanceof DomainEventableEntity) {
      this.createEvent(this.events.EVENT_UPDATED, entity);
    }

    if (this.useTransaction) {
      if (this.repo instanceof TransactionalRepository) {
        const result = await this.repo.transaction(async () => {
          await Promise.all(
            this.repo.metadata.relations.map(async (relation) =>
              this.assingRelations(entity, update, relation)
            )
          ).then(() => entity);

          return this.repo.save(entity);
        });

        return result;
      }

      throw new Error('Repository should extend by TransactionalRepository');
    }

    return this.repo.save(entity);
  }

  async assingRelations<Relation>(
    entity: Entity,
    update: DeepPartial<Entity>,
    relation: RelationMetadata
  ): Promise<void> {
    const entityRelatedValue = relation.getEntityValue(entity);
    const objectRelatedValue = relation.getEntityValue(update);

    if (objectRelatedValue === undefined) return;

    const objectRelatedArrayValue = Array.isArray(objectRelatedValue)
      ? objectRelatedValue
      : [objectRelatedValue];

    const existingRelations: Relation[] =
      entityRelatedValue ??
      (await this.createTypeormRelationQueryBuilder(entity, relation.propertyName).loadMany());
    const relationQueryBuilder = this.getRelationQueryBuilder(
      relation.propertyName
    ).filterQueryBuilder;

    let objectRelatedNewRelations = [];
    const objectRelatedExisting: Relation[] = [];

    objectRelatedNewRelations = objectRelatedArrayValue.filter(
      (objectRelatedValueItem) =>
        objectRelatedValueItem &&
        (existingRelations.length === 0 ||
          !existingRelations.find((entityRelatedValueItem) =>
            relation.inverseEntityMetadata.compareEntities(
              objectRelatedValueItem,
              entityRelatedValueItem
            )
          ))
    );

    existingRelations.forEach((objectRelatedValueItem) => {
      const objectRelatedValueEntity = objectRelatedArrayValue.find((entityRelatedValueItem) =>
        relation.inverseEntityMetadata.compareEntities(
          objectRelatedValueItem,
          entityRelatedValueItem
        )
      );

      if (objectRelatedValueEntity) {
        objectRelatedExisting.push(objectRelatedValueItem);
      }
    });

    let objectRelatedNewRelationValues: unknown[] = [];

    if (objectRelatedNewRelations.length) {
      const newRelationsFilter: Filter<Entity>[] = [];

      objectRelatedNewRelations.forEach((objectRelatedValueItem) => {
        const inverseEntityMetadata =
          relation.inverseEntityMetadata.findInheritanceMetadata(objectRelatedValueItem);
        const idMap = inverseEntityMetadata.getEntityIdMap(objectRelatedValueItem);

        Object.entries(idMap).forEach(([key, value]) => {
          newRelationsFilter.push({ [key]: { eq: value } } as FilterComparisons<Entity>);
        });
      });

      objectRelatedNewRelationValues = await relationQueryBuilder
        .select({ filter: { or: newRelationsFilter } })
        .getMany();

      if (objectRelatedNewRelationValues.length !== objectRelatedNewRelations.length) {
        throw new Error(
          `Unable to find all ${relation.propertyName} to add to ${this.EntityClassName}`
        );
      }
    }

    const newRelations = objectRelatedNewRelationValues.concat(objectRelatedExisting);

    if (relation.isOneToMany || relation.isManyToMany) {
      relation.setEntityValue(entity, newRelations);
    } else {
      relation.setEntityValue(entity, newRelations.pop() ?? null);
    }
  }

  async ensureEntityDoesNotExistByFilter(
    filter: Filter<Entity>,
    opts?: QueryOptions
  ): Promise<void> {
    const entity = await this.filterQueryBuilder.select({ filter }, opts).getOne();

    if (entity) {
      throw new Error('Entity already exists');
    }
  }

  private injectSetters(record: DeepPartial<Entity>): void {
    const setters = this.setters?.all();

    if (setters) {
      Object.entries(setters).forEach((setter) => {
        if (setter[1].supports(this.repo.metadata)) {
          setter[1].execute(record);
        }
      });
    }
  }

  private createEvent(name: string, entity: Entity): DomainEvent {
    const eventName = `${convertToSnakeCase(this.EntityClassName)}_${name}`;
    const event = new DomainEvent({ eventName });

    Object.assign(event, cloneDeep(omit(entity, ['_domainEvents'])));
    entity.addEvent(event);

    return event;
  }

  private copyRegularColumn(entity: Entity, record: DeepPartial<Entity>): void {
    this.repo.metadata.nonVirtualColumns.forEach((column) => {
      const objectColumnValue = column.getEntityValue(record);
      if (objectColumnValue !== undefined) column.setEntityValue(entity, objectColumnValue);
    });
  }
}
