import { DeepPartial, EntityMetadata } from 'typeorm';

export interface EntitySetter<Entity> {
  supports(metadata: EntityMetadata): boolean;

  execute<T extends DeepPartial<Entity>>(entityOrEntities: T | T[]): void;
}
