import { EntitySchema } from 'typeorm';

import { ROLE_SETTING_ENTITY, ROLE_ENTITY } from '@owl-app/lib-api-core/entity-tokens';

import { RoleSettingEntity } from '../../domain/entity/role-setting.entity';

export const RoleSettingEntitySchema = new EntitySchema<RoleSettingEntity>({
  target: RoleSettingEntity,
  name: ROLE_SETTING_ENTITY,
  tableName: 'role_setting',
  columns: {
    id: {
      type: String,
      generated: 'uuid',
      primary: true,
    },
    displayName: {
      name: 'display_name',
      type: String,
      nullable: true,
    },
    theme: {
      type: String,
      nullable: true,
    },
  },
  relations: {
    role: {
      type: 'one-to-one',
      target: ROLE_ENTITY,
      joinColumn: {
        name: 'role_name',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
});
