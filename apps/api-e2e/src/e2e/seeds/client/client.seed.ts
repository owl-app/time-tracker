import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { Client } from '@owl-app/lib-contracts';

import { ClientEntitySchema } from '@owl-app/lib-api-module-client/database/entity-schema/client.entity-schema';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';

import { uniqueClientName } from '../unique';

export default class ClientSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<Partial<Client[]>> {
    const userFactory = await factoryManager.get(ClientEntitySchema);

    let clients: Client[] = [];
    const promisesClients: Promise<Client[]>[] = [];

    Object.values(dataUsers).map((users) =>
      users.map(async (user) => {
        userFactory.setMeta({ unique: uniqueClientName });
        promisesClients.push(
          userFactory.saveMany(1, {
            name: uniqueClientName,
            tenant: user.tenant,
            archived: false,
          })
        );

        userFactory.setMeta({});
        promisesClients.push(
          userFactory.saveMany(5, {
            tenant: user.tenant,
            archived: true,
          })
        );
        promisesClients.push(
          userFactory.saveMany(5, {
            tenant: user.tenant,
            archived: false,
          })
        );
      })
    )

    clients = await Promise.all(promisesClients).then(results => results.flat());

    return clients;
  }
}
