import { EntitySchema } from 'typeorm';

import { TENANT_ENTITY, USER_ENTITY } from '@owl-app/lib-api-core/entity-tokens';
import { TimestampableSchemaPart } from '@owl-app/lib-api-core/database/entity-schema/timestampable.schemat';

import { TenantEntity } from '../../domain/entity/tenant.entity';

export const TenantEntitySchema = new EntitySchema<TenantEntity>({
  target: TenantEntity,
  name: TENANT_ENTITY,
  tableName: 'tenant',
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
  },
  relations: {
    users: {
      type: 'one-to-many',
      target: USER_ENTITY,
      cascade: true,
      inverseSide: 'tenant',
    },
  },
});
