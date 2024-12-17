import type { RoleSetting } from '@owl-app/lib-contracts';
import { RoleEntity } from './role.entity';

export class RoleSettingEntity implements RoleSetting {
  id: string;

  role: Partial<RoleEntity>;

  displayName: string;

  theme: string;
}
