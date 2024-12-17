import { EntityMetadata, SelectQueryBuilder } from 'typeorm';

export interface FilterQuery<Entity> {
  supports(metadata: EntityMetadata): boolean;

  execute(qb: SelectQueryBuilder<Entity>): void;
}
