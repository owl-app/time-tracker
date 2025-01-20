import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { TenantEntity } from '../__fixtures__/tenant.entity';

import { TEST_TENANT_CREATED } from './data/tenant.data';

export default class TenantSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
  ): Promise<TenantEntity[]> {
      const created: TenantEntity[] = [];

      await dataSource.transaction(async (manager) => {
        created.push(...(await manager.save(TenantEntity, TEST_TENANT_CREATED)));
      });

      return created;
  }
}
