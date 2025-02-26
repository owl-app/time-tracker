import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { Project, Tag, Time, User } from '@owl-app/lib-contracts';

import { TimeEntitySchema } from '@owl-app/lib-api-module-time-tracker/database/entity-schema/time.entity-schema';
import { TagEntitySchema } from '@owl-app/lib-api-module-tag/database/entity-schema/tag.entity-schema';
import { PROJECTT_ENTITY } from '@owl-app/lib-api-core/entity-tokens';
import { dataTenants } from '@owl-app/lib-api-core/seeds/data/tenant';

import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import { uniqueTimeTrackerDescription } from '../unique';

export default class TestTimeTrackerSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<Partial<Time[]>> {
    const projectRepository = dataSource.getRepository<Project>(PROJECTT_ENTITY);
    const tagRepository = dataSource.getRepository<Tag>(TagEntitySchema);
    const timeTrackerFactory = await factoryManager.get(TimeEntitySchema);

    const projectTenant1 = await projectRepository
      .createQueryBuilder('project')
      .innerJoinAndSelect('project.tenant', 'tenant')
      .where('tenant.id = :tenantId', { tenantId: dataTenants.tenantFirst.id })
      .getMany();
    const projectTenant2 = await projectRepository
      .createQueryBuilder('project')
      .innerJoinAndSelect('project.tenant', 'tenant')
      .where('tenant.id = :tenantId', { tenantId: dataTenants.tenantSecond.id })
      .getMany();

    const tagTenant1 = await tagRepository
      .createQueryBuilder('tag')
      .innerJoinAndSelect('tag.tenant', 'tenant')
      .where('tenant.id = :tenantId', { tenantId: dataTenants.tenantFirst.id })
      .getMany();
    const tagTenant2 = await tagRepository
      .createQueryBuilder('tag')
      .innerJoinAndSelect('tag.tenant', 'tenant')
      .where('tenant.id = :tenantId', { tenantId: dataTenants.tenantSecond.id })
      .getMany();

    const projectsByTenant = {
      [dataTenants.tenantFirst.id]: projectTenant1,
      [dataTenants.tenantSecond.id]: projectTenant2,
    };

    const tagsByTenant = {
      [dataTenants.tenantFirst.id]: tagTenant1,
      [dataTenants.tenantSecond.id]: tagTenant2,
    };

    let times: Time[] = [];
    const promises: Promise<Time[]>[] = [];
    let timeTrackerIterator = 0;

    Object.values(dataUsers).forEach((users) => {
      users.map(async (user) => {
        timeTrackerFactory.setMeta({ unique: uniqueTimeTrackerDescription });
        promises.push(
          timeTrackerFactory.saveMany(1, {
            description: uniqueTimeTrackerDescription,
            tenant: user.tenant,
            user: user as User,
            project: projectsByTenant[user.tenant.id][timeTrackerIterator],
            tags: [tagsByTenant[user.tenant.id][timeTrackerIterator]],
          })
        );

        timeTrackerIterator += 1;

        timeTrackerFactory.setMeta({});
        promises.push(
          timeTrackerFactory.saveMany(5, {
            tenant: user.tenant,
            user: user as User,
            project: projectsByTenant[user.tenant.id][timeTrackerIterator],
            tags: [tagsByTenant[user.tenant.id][timeTrackerIterator]],
          })
        );

        timeTrackerIterator += 1;

        promises.push(
          timeTrackerFactory.saveMany(5, {
            tenant: user.tenant,
            user: user as User,
            project: projectsByTenant[user.tenant.id][timeTrackerIterator],
            tags: [tagsByTenant[user.tenant.id][timeTrackerIterator]],
          })
        );
      });

      timeTrackerIterator += 1;
    });

    times = await Promise.all(promises).then((results) => results.flat());

    return times;
  }
}
