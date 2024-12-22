import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { Client } from '@owl-app/lib-contracts';

import { ClientEntitySchema } from '@owl-app/lib-api-module-client/database/entity-schema/client.entity-schema';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';

import { uniqueClientId, uniqueClientName } from '../unique';
import { CreatedSeedData } from '../../types';

export default class ClientSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<Partial<CreatedSeedData<Client[]>>> {
    const userFactory = await factoryManager.get(ClientEntitySchema);

    const adminSystem = [];
    const adminCompany = [];

    userFactory.setMeta({ unique: uniqueClientName });
    adminSystem.push(
      ...(await userFactory.saveMany(1, {
        id: uniqueClientId.adminSystem,
        name: uniqueClientName,
        tenant: dataUsers.adminSystem.tenant,
        archived: false,
      }))
    );
    adminCompany.push(
      ...(await userFactory.saveMany(1, {
        id: uniqueClientId.adminCompany,
        name: uniqueClientName,
        tenant: dataUsers.adminCompany.tenant,
        archived: false,
      }))
    );

    userFactory.setMeta({});
    // Create 5 archived and 5 active clients for Admin System role
    adminSystem.push(
      ...(await userFactory.saveMany(5, {
        tenant: dataUsers.adminSystem.tenant,
        archived: true,
      })),
      ...(await userFactory.saveMany(5, {
        tenant: dataUsers.adminSystem.tenant,
        archived: false,
      }))
    );
    // Create 5 archived and 5 active clients for Admin company role
    adminCompany.push(
      ...(await userFactory.saveMany(5, {
        tenant: dataUsers.adminCompany.tenant,
        archived: true,
      })),
      ...(await userFactory.saveMany(5, {
        tenant: dataUsers.adminCompany.tenant,
        archived: false,
      }))
    );

    return {
      adminSystem: [...adminSystem, ...adminCompany],
      adminCompany
    };
  }
}
