import { Permission, RoleSetting } from '@owl-app/lib-contracts';
import { BaseAuthItemEntity } from './base-auth.entity';

export class RoleEntity extends BaseAuthItemEntity {
  setting: RoleSetting;

  permissions: Permission;
}
