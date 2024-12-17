import { EntitySchema } from 'typeorm';

import {
  PERMISSION_ENITY,
  ROLE_ENTITY,
  ROLE_SETTING_ENTITY,
} from '@owl-app/lib-api-core/entity-tokens';

import { RoleEntity } from '../../domain/entity/role.entity';
import { BaseAuthEntitySchema } from './base-auth.entity-schema';

export const RoleEntitySchema = new EntitySchema<RoleEntity>({
  target: RoleEntity,
  name: ROLE_ENTITY,
  type: 'entity-child',
  // When saving instances of 'A', the "type" column will have the value
  // specified on the 'discriminatorValue' property
  discriminatorValue: 'role',
  columns: {
    ...BaseAuthEntitySchema.options.columns,
  },
  relations: {
    setting: {
      cascade: true,
      type: 'one-to-one',
      target: ROLE_SETTING_ENTITY,
      inverseSide: 'role',
    },
    permissions: {
      type: 'many-to-many',
      target: PERMISSION_ENITY,
      cascade: true,
      joinTable: {
        name: 'rbac_item_child',
        joinColumn: {
          name: 'parent',
        },
        inverseJoinColumn: {
          name: 'child',
        },
      },
    },
  },
});
