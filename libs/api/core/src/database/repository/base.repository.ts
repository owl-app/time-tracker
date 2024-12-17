import { DeepPartial, EntityManager, EntityTarget, QueryRunner, SaveOptions } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import BaseEntity from '../entity/base.entity';

import { TransactionalRepository } from './transactional.repository';
import DomainEventableEntity from '../entity/domain-eventable.entity';

export class BaseRepository<Entity extends BaseEntity> extends TransactionalRepository<Entity> {
  constructor(
    target: EntityTarget<Entity>,
    manager: EntityManager,
    queryRunner?: QueryRunner,
    readonly eventEmitter?: EventEmitter2
  ) {
    super(target, manager, queryRunner);
  }

  /**
   * Creates a new entity instance.
   */
  create(): Entity;

  /**
   * Creates new entities and copies all entity properties from given objects into their new entities.
   * Note that it copies only properties that are present in entity schema.
   */
  create(entityLikeArray: DeepPartial<Entity>[]): Entity[];

  /**
   * Creates a new entity instance and copies all entity properties from this object into a new entity.
   * Note that it copies only properties that are present in entity schema.
   */
  create(entityLike: DeepPartial<Entity>): Entity;

  /**
   * Creates a new entity instance or instances.
   * Can copy properties from the given object into new entities.
   */
  create(
    plainEntityLikeOrPlainEntityLikes?: DeepPartial<Entity> | DeepPartial<Entity>[]
  ): Entity | Entity[] {
    const newEntity: Entity | Entity[] = this.manager.create(
      this.metadata.target as EntityTarget<Entity>,
      plainEntityLikeOrPlainEntityLikes as unknown as DeepPartial<Entity>[]
    );

    this.copyOriginalEvents(newEntity, plainEntityLikeOrPlainEntityLikes);

    return newEntity;
  }

  /**
   * Saves all given entities in the database.
   * If entities do not exist in the database then inserts, otherwise updates.
   */
  override async save<T extends DeepPartial<Entity>>(
    entities: T[],
    options: SaveOptions & { reload: false }
  ): Promise<T[]>;

  /**
   * Saves all given entities in the database.
   * If entities do not exist in the database then inserts, otherwise updates.
   */
  override async save<T extends DeepPartial<Entity>>(
    entities: T[],
    options?: SaveOptions
  ): Promise<(T & Entity)[]>;

  /**
   * Saves a given entity in the database.
   * If entity does not exist in the database then inserts, otherwise updates.
   */
  override async save<T extends DeepPartial<Entity>>(
    entity: T,
    options: SaveOptions & { reload: false }
  ): Promise<T>;

  /**
   * Saves a given entity in the database.
   * If entity does not exist in the database then inserts, otherwise updates.
   */
  override async save<T extends DeepPartial<Entity>>(
    entity: T,
    options?: SaveOptions
  ): Promise<T & Entity>;

  /**
   * Saves one or many given entities.
   */
  override async save<T extends DeepPartial<Entity>>(
    entityOrEntities: T | T[],
    options?: SaveOptions
  ): Promise<T | T[]> {
    const savedEntity = await this.getManager().save<Entity, T>(
      this.metadata.target as EntityTarget<Entity>,
      entityOrEntities as never,
      options
    );

    await Promise.all(
      (!Array.isArray(savedEntity) ? [savedEntity] : savedEntity).map(async (entity) => {
        if (entity instanceof DomainEventableEntity) {
          await entity.publishEvents(entity.id, this.eventEmitter);
        }
      })
    );

    return savedEntity;
  }

  private copyOriginalEvents(
    entity: Entity | Entity[],
    record: DeepPartial<Entity> | DeepPartial<Entity>[]
  ): void {
    function copy(entityCopy: Entity, recordCopy: Entity) {
      if (recordCopy instanceof DomainEventableEntity) {
        recordCopy.domainEvents.forEach((event) => {
          entityCopy.addEvent(event);
        });
      }
    }

    if (Array.isArray(entity)) {
      entity.forEach((entityMap, index) => {
        copy(entityMap, Array(record as Entity)[index]);
      });
    } else {
      copy(entity, record as Entity);
    }
  }
}
