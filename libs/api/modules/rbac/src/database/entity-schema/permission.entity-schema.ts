import { EntitySchema } from 'typeorm';

import { PERMISSION_ENITY } from '@owl-app/lib-api-core/entity-tokens';

import { PermissionEntity } from '../../domain/entity/permission.entity';
import { BaseAuthEntitySchema } from './base-auth.entity-schema';

export const PermissionEntitySchema = new EntitySchema<PermissionEntity>({
  target: PermissionEntity,
  name: PERMISSION_ENITY,
  type: 'entity-child',
  discriminatorValue: 'permission',
  columns: {
    ...BaseAuthEntitySchema.options.columns,
    refer: {
      type: String,
      nullable: true,
    },
  },
});
