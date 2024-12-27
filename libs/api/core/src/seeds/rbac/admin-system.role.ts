import { DataSource } from 'typeorm';

import {
  AvalilableCollections,
  Permission,
  UserActions,
  TimeActions,
  RoleActions,
  TagActions,
  ProjectActions,
  CommonActions,
  RolesEnum,
  Role,
} from '@owl-app/lib-contracts';

import { ROLE_ENTITY } from '../../entity-tokens';

import BaseRole from './base.role';
import { dataRoles } from '../data/role';

export class AdminSystemRoleSeeder extends BaseRole {
  getRoleName(): RolesEnum {
    return RolesEnum.ROLE_ADMIN_SYSTEM;
  }

  public async run(dataSource: DataSource): Promise<Role> {
    const repository = dataSource.getRepository(ROLE_ENTITY);

    const roleAdmin = {
      name: RolesEnum.ROLE_ADMIN_SYSTEM,
      description: 'Admin system',
      permissions: dataRoles[RolesEnum.ROLE_ADMIN_SYSTEM],
      setting: { displayName: 'Admin system' },
    };

    const createdRole = await repository.save(roleAdmin);

    return createdRole;
  }
}
