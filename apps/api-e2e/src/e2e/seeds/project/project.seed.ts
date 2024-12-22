import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { Client, Project } from '@owl-app/lib-contracts';
import { ProjectEntitySchema } from '@owl-app/lib-api-module-project/database/entity-schema/project.entity-schema';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import { uniqueProjectId, uniqueProjectName, uniqueClientId } from '../unique';
import { CreatedSeedData } from '../../types';

export default class ProjectSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const userFactory = await factoryManager.get(ProjectEntitySchema);

    const result: Partial<CreatedSeedData<Project[]>> = {
      adminSystem: [],
      adminCompany: [],
    };

    userFactory.setMeta({ unique: uniqueProjectName });
    result.adminSystem.push(
      ...(await userFactory.saveMany(1, {
        id: uniqueProjectId.adminSystem,
        name: uniqueProjectName,
        tenant: dataUsers.adminSystem.tenant,
        client: { id: uniqueClientId.adminSystem } as Client,
        archived: false,
      }))
    );
    result.adminCompany.push(
      ...(await userFactory.saveMany(1, {
        id: uniqueProjectId.adminCompany,
        name: uniqueProjectName,
        tenant: dataUsers.adminCompany.tenant,
        client: { id: uniqueClientId.adminCompany } as Client,
        archived: false,
      }))
    );

    userFactory.setMeta({});
    // Create 5 archived and 5 active projects for Admin System role
    result.adminSystem.push(
      ...(await userFactory.saveMany(5, {
        tenant: dataUsers.adminSystem.tenant,
        client: { id: uniqueClientId.adminSystem } as Client,
        archived: true,
      })),
      ...(await userFactory.saveMany(5, {
        tenant: dataUsers.adminSystem.tenant,
        client: { id: uniqueClientId.adminSystem } as Client,
        archived: false,
      }))
    );
    result.adminCompany.push(
      // Create 5 archived and 5 active projects for Admin Company role
      ...(await userFactory.saveMany(5, {
        tenant: dataUsers.adminCompany.tenant,
        client: { id: uniqueClientId.adminCompany } as Client,
        archived: true,
      })),
      ...(await userFactory.saveMany(5, {
        tenant: dataUsers.adminCompany.tenant,
        client: { id: uniqueClientId.adminCompany } as Client,
        archived: false,
      }))
    );

    return result;
  }
}
