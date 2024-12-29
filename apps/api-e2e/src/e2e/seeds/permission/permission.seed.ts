import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { Permission } from '@owl-app/lib-contracts';

import { PermissionEntitySchema } from '@owl-app/lib-api-module-rbac/database/entity-schema/permission.entity-schema';

import { uniquePermissionName, uniquePermissionDescription } from '../unique';

export default class PermissionSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<Partial<Permission[]>> {
    const userFactory = await factoryManager.get(PermissionEntitySchema);

    const permisssions: Permission[] = [];

    userFactory.setMeta({ unique: uniquePermissionName });
    permisssions.push(
      ...(await userFactory.saveMany(1, {
        name: uniquePermissionName,
        description: uniquePermissionDescription,
        collection: 'Test',
        refer: 'Route',
      }))
    );

    userFactory.setMeta({});
    permisssions.push(
      ...(await userFactory.saveMany(1, {
        collection: 'Test',
        refer: 'Route',
      }))
    );

    permisssions.push(
      ...(await userFactory.saveMany(1, {
        collection: 'Test',
        refer: 'Field',
      }))
    );

    return permisssions;
  }
}
