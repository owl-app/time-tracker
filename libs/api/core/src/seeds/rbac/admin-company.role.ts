import { DataSource } from 'typeorm';

import {
  AvalilableCollections,
  Permission,
  UserActions,
  RoleActions,
  TagActions,
  ProjectActions,
  CommonActions,
  RolesEnum,
  TimeActions,
  Role,
} from '@owl-app/lib-contracts';

import { ROLE_ENTITY } from '../../entity-tokens';

import BaseRole from './base.role';
import { dataRoles } from '../data/role';

export class AdminCompanyRoleSeeder extends BaseRole {
  getRoleName(): RolesEnum {
    return RolesEnum.ROLE_ADMIN_COMPANY;
  }

  public async run(dataSource: DataSource): Promise<Role> {
    const repository = dataSource.getRepository(ROLE_ENTITY);

    const roleAdmin = {
      name: RolesEnum.ROLE_ADMIN_COMPANY,
      description: 'Admin company',
      permissions: dataRoles[RolesEnum.ROLE_ADMIN_COMPANY],
      setting: { displayName: 'Admin company' },
    };

    const createdRole = await repository.save(roleAdmin);

    return createdRole;
  }
}
