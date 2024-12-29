import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { RolesEnum, Role } from '@owl-app/lib-contracts';

import { ROLE_ENTITY } from '../entity-tokens';
import { dataRoles } from './data/role';

export class RoleSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<Role[]> {
    const repository = dataSource.getRepository(ROLE_ENTITY);

    const roleAdminSystem = {
      name: RolesEnum.ROLE_ADMIN_SYSTEM,
      description: 'Admin system',
      permissions: dataRoles[RolesEnum.ROLE_ADMIN_SYSTEM],
      setting: { displayName: 'Admin system' },
    };

    const roleAdminCompany = {
      name: RolesEnum.ROLE_ADMIN_COMPANY,
      description: 'Admin company',
      permissions: dataRoles[RolesEnum.ROLE_ADMIN_COMPANY],
      setting: { displayName: 'Admin company' },
    };

    const roleUser = {
      name: RolesEnum.ROLE_USER,
      description: 'User',
      permissions: dataRoles[RolesEnum.ROLE_USER],
      setting: { displayName: 'User' },
    };

    const createdRole = await repository.save([roleAdminSystem, roleAdminCompany, roleUser]);

    return createdRole;
  }
}
