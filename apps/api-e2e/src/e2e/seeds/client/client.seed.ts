import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { ClientEntitySchema } from '@owl-app/lib-api-module-client/database/entity-schema/client.entity-schema';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import { uniqueClientId, uniqueClientName } from './unique';

export default class ClientSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const userFactory = await factoryManager.get(ClientEntitySchema);

    userFactory.setMeta({ unique: 'Unique company name' });
    await userFactory.saveMany(1, { id: uniqueClientId.adminSystem, name: uniqueClientName, tenant: dataUsers.adminSystem.tenant, archived: false });
    await userFactory.saveMany(1, { id: uniqueClientId.adminCompany, name: uniqueClientName, tenant: dataUsers.adminCompany.tenant, archived: false });

    userFactory.setMeta({});
    await userFactory.saveMany(5, {
      tenant: dataUsers.adminSystem.tenant,
      archived: true,
    });
    await userFactory.saveMany(5, {
      tenant: dataUsers.adminSystem.tenant,
      archived: false,
    });

    await userFactory.saveMany(5, {
      tenant: dataUsers.adminCompany.tenant,
      archived: true,
    });
    await userFactory.saveMany(5, {
      tenant: dataUsers.adminCompany.tenant,
      archived: false,
    });
  }
}
