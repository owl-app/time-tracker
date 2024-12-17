import { EntitySchema } from 'typeorm';

import {
  CLIENT_ENTITY,
  PROJECTT_ENTITY,
  TENANT_ENTITY,
  TIME_ENTITY,
} from '@owl-app/lib-api-core/entity-tokens';
import { TimestampableSchemaPart } from '@owl-app/lib-api-core/database/entity-schema/timestampable.schemat';
import { ArchiveableSchemaPart } from '@owl-app/lib-api-core/database/entity-schema/archiveable.schema';

import { ProjectEntity } from '../../domain/entity/project.entity';

export const ProjectEntitySchema = new EntitySchema<ProjectEntity>({
  target: ProjectEntity,
  name: PROJECTT_ENTITY,
  tableName: 'project',
  columns: {
    id: {
      type: String,
      generated: 'uuid',
      primary: true,
    },
    name: {
      type: String,
    },
    ...TimestampableSchemaPart,
    ...ArchiveableSchemaPart,
  },
  relations: {
    tenant: {
      type: 'many-to-one',
      target: TENANT_ENTITY,
      // cascade: true,
      joinColumn: {
        name: 'tenant_id',
      },
    },
    client: {
      type: 'many-to-one',
      target: CLIENT_ENTITY,
      cascade: true,
      onDelete: 'CASCADE',
      joinColumn: {
        name: 'client_id',
      },
    },
    times: {
      type: 'one-to-many',
      target: TIME_ENTITY,
      inverseSide: 'project',
    },
  },
});
