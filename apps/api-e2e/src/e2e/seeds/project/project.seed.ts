import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { Client, Project } from '@owl-app/lib-contracts';

import { ProjectEntitySchema } from '@owl-app/lib-api-module-project/database/entity-schema/project.entity-schema';
import { CLIENT_ENTITY } from '@owl-app/lib-api-core/entity-tokens';
import { dataTenants } from '@owl-app/lib-api-core/seeds/data/tenant';

import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import { uniqueProjectName } from '../unique';

export default class TestProjectSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<Partial<Project[]>> {
    const clientRepository = dataSource.getRepository<Client>(CLIENT_ENTITY);
    const userFactory = await factoryManager.get(ProjectEntitySchema);

    const clientTenant1 = await clientRepository
      .createQueryBuilder('client')
      .innerJoinAndSelect('client.tenant', 'tenant')
      .where('tenant.id = :tenantId', { tenantId: dataTenants.tenantFirst.id })
      .getMany();
    const clientTenant2 = await clientRepository
      .createQueryBuilder('client')
      .innerJoinAndSelect('client.tenant', 'tenant')
      .where('tenant.id = :tenantId', { tenantId: dataTenants.tenantSecond.id })
      .getMany();

    const clientsByTenant = {
      [dataTenants.tenantFirst.id]: clientTenant1,
      [dataTenants.tenantSecond.id]: clientTenant2,
    };

    let projects: Project[] = [];
    const promises: Promise<Project[]>[] = [];
    let clientIterator = 0;

    Object.values(dataUsers).forEach((users) => {
      users.map(async (user) => {
        userFactory.setMeta({ unique: uniqueProjectName });
        promises.push(
          userFactory.saveMany(1, {
            name: uniqueProjectName,
            tenant: user.tenant,
            client: clientsByTenant[user.tenant.id][clientIterator],
            archived: false,
          })
        );

        clientIterator += 1;

        userFactory.setMeta({});
        promises.push(
          userFactory.saveMany(5, {
            tenant: user.tenant,
            client: clientsByTenant[user.tenant.id][clientIterator],
            archived: true,
          })
        );

        clientIterator += 1;

        promises.push(
          userFactory.saveMany(5, {
            tenant: user.tenant,
            client: clientsByTenant[user.tenant.id][clientIterator],
            archived: false,
          })
        );
      });

      clientIterator += 1;
    });

    projects = await Promise.all(promises).then((results) => results.flat());

    return projects;
  }
}
