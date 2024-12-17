import { EntitySchema } from 'typeorm';

import { CLIENT_ENTITY, PROJECTT_ENTITY, TENANT_ENTITY } from '@owl-app/lib-api-core/entity-tokens';
import { TimestampableSchemaPart } from '@owl-app/lib-api-core/database/entity-schema/timestampable.schemat';
import { ArchiveableSchemaPart } from '@owl-app/lib-api-core/database/entity-schema/archiveable.schema';

import { ClientEntity } from '../../domain/entity/client.entity';

export const ClientEntitySchema = new EntitySchema<ClientEntity>({
  target: ClientEntity,
  name: CLIENT_ENTITY,
  tableName: 'client',
  columns: {
    id: {
      type: String,
      generated: 'uuid',
      primary: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      nullable: true,
    },
    address: {
      type: String,
      nullable: true,
    },
    description: {
      type: 'text',
      nullable: true,
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
    projects: {
      type: 'one-to-many',
      target: PROJECTT_ENTITY,
      inverseSide: 'client',
    },
  },
});
