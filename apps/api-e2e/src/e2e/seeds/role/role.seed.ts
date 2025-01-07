import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { Role } from '@owl-app/lib-contracts';

import { RoleEntitySchema } from '@owl-app/lib-api-module-rbac/database/entity-schema/role.entity-schema';

import { uniqueRoleName } from '../unique';

export default class TestRoleSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<Partial<Role[]>> {
    const userFactory = await factoryManager.get(RoleEntitySchema);

    const roles: Role[] = [];

    userFactory.setMeta({ unique: uniqueRoleName });

    roles.push(
      ...(await userFactory.saveMany(1, {
        name: uniqueRoleName,
      }))
    );

    roles.push(
      ...(await userFactory.saveMany(1))
    );

    roles.push(
      ...(await userFactory.saveMany(1))
    );

    return roles;
  }
}
