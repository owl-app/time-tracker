import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { Client, Project, RolesEnum } from '@owl-app/lib-contracts';
import { ProjectEntitySchema } from '@owl-app/lib-api-module-project/database/entity-schema/project.entity-schema';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import { uniqueProjectId, uniqueProjectName, uniqueClientId } from '../unique';
import { CreatedSeedData } from '../../types';

export default class ProjectSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<Partial<CreatedSeedData<Project[]>>> {
    const userFactory = await factoryManager.get(ProjectEntitySchema);

    const adminSystem = [];
    const adminCompany = [];

    userFactory.setMeta({ unique: uniqueProjectName });
    adminSystem.push(
      ...(await userFactory.saveMany(1, {
        id: uniqueProjectId[RolesEnum.ROLE_ADMIN_SYSTEM],
        name: uniqueProjectName,
        tenant: dataUsers[RolesEnum.ROLE_ADMIN_SYSTEM].tenant,
        client: { id: uniqueClientId[RolesEnum.ROLE_ADMIN_COMPANY] } as Client,
        archived: false,
      }))
    );
    adminCompany.push(
      ...(await userFactory.saveMany(1, {
        id: uniqueProjectId[RolesEnum.ROLE_ADMIN_COMPANY],
        name: uniqueProjectName,
        tenant: dataUsers[RolesEnum.ROLE_ADMIN_COMPANY].tenant,
        client: { id: uniqueClientId[RolesEnum.ROLE_ADMIN_COMPANY] } as Client,
        archived: false,
      }))
    );

    userFactory.setMeta({});
    // Create 5 archived and 5 active projects for Admin System role
    adminSystem.push(
      ...(await userFactory.saveMany(5, {
        tenant: dataUsers[RolesEnum.ROLE_ADMIN_SYSTEM].tenant,
        client: { id: uniqueClientId[RolesEnum.ROLE_ADMIN_SYSTEM] } as Client,
        archived: true,
      })),
      ...(await userFactory.saveMany(5, {
        tenant: dataUsers[RolesEnum.ROLE_ADMIN_SYSTEM].tenant,
        client: { id: uniqueClientId[RolesEnum.ROLE_ADMIN_SYSTEM] } as Client,
        archived: false,
      }))
    );
    adminCompany.push(
      // Create 5 archived and 5 active projects for Admin Company role
      ...(await userFactory.saveMany(5, {
        tenant: dataUsers[RolesEnum.ROLE_ADMIN_COMPANY].tenant,
        client: { id: uniqueClientId[RolesEnum.ROLE_ADMIN_COMPANY] } as Client,
        archived: true,
      })),
      ...(await userFactory.saveMany(5, {
        tenant: dataUsers[RolesEnum.ROLE_ADMIN_COMPANY].tenant,
        client: { id: uniqueClientId[RolesEnum.ROLE_ADMIN_COMPANY] } as Client,
        archived: false,
      }))
    );

    return {
      [RolesEnum.ROLE_ADMIN_SYSTEM]: [...adminSystem, ...adminCompany],
      [RolesEnum.ROLE_ADMIN_COMPANY]: adminCompany,
    };
  }
}
