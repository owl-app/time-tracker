import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { Project } from '@owl-app/lib-contracts';

import { ProjectEntitySchema } from '@owl-app/lib-api-module-project/database/entity-schema/project.entity-schema';
import { CLIENT_ENTITY } from '@owl-app/lib-api-core/entity-tokens';
import { dataTenants } from '@owl-app/lib-api-core/seeds/data/tenant';
import { ClientEntity } from '@owl-app/lib-api-module-client/domain/entity/client.entity';

import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import { uniqueProjectName } from '../unique';

export default class ProjectSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<Partial<Project[]>> {
    const clientRepository = dataSource.getRepository<ClientEntity>(CLIENT_ENTITY);
    const userFactory = await factoryManager.get(ProjectEntitySchema);


    const clientTenant1 = await clientRepository
      .createQueryBuilder("client")
      .innerJoinAndSelect("client.tenant", "tenant")
      .where("tenant.id = :tenantId", { tenantId: dataTenants.tenant_1.id })
      .getOne()
    const clientTenant2 = await clientRepository
      .createQueryBuilder("client")
      .innerJoinAndSelect("client.tenant", "tenant")
      .where("tenant.id = :tenantId", { tenantId: dataTenants.tenant_2.id })
      .getOne();

    const clientsByTenant = {
      [dataTenants.tenant_1.id]: clientTenant1,
      [dataTenants.tenant_2.id]: clientTenant2,
    };

    let projects: Project[] = [];
    const promisesProjects: Promise<Project[]>[] = [];

    Object.values(dataUsers).map((users) =>
      users.map(async (user) => {
        userFactory.setMeta({ unique: uniqueProjectName });
        promisesProjects.push(
          userFactory.saveMany(1, {
            name: uniqueProjectName,
            tenant: user.tenant,
            client: clientsByTenant[user.tenant.id],
            archived: false,
          })
        );

        userFactory.setMeta({});
        promisesProjects.push(
          userFactory.saveMany(5, {
            tenant: user.tenant,
            client: clientsByTenant[user.tenant.id],
            archived: true,
          })
        );
        promisesProjects.push(
          userFactory.saveMany(5, {
            tenant: user.tenant,
            client: clientsByTenant[user.tenant.id],
            archived: false,
          })
        );
      })
    )

    projects = await Promise.all(promisesProjects).then(results => results.flat());

    return projects;
  }
}
