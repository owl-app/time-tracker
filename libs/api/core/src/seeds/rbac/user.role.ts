import { DataSource } from 'typeorm';

import {
  AvalilableCollections,
  Permission,
  TimeActions,
  RolesEnum,
  Role,
} from '@owl-app/lib-contracts';

import { ROLE_ENTITY } from '../../entity-tokens';

import BaseRole from './base.role';

export class UserRoleSeeder extends BaseRole {
  getRoleName(): RolesEnum {
    return RolesEnum.ROLE_USER;
  }

  public async run(dataSource: DataSource): Promise<Role> {
    const repository = dataSource.getRepository(ROLE_ENTITY);
    const permissions: Permission[] = [
      // time
      ...this.getCrudPermissions(AvalilableCollections.TIME),
      ...this.getPermissionsByCollection<typeof TimeActions>(
        AvalilableCollections.TIME,
        TimeActions
      ),
    ];
    const roleUser = {
      name: RolesEnum.ROLE_USER,
      description: 'User',
      permissions,
      setting: { displayName: 'User' },
    };

    const createdRole = await repository.save(roleUser);

    return createdRole;
  }
}
