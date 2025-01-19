import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { TestSimpleEntity } from '../__fixtures__/test-simple.entity';
import { TEST_BASE_ENTITIES_CREATED, TEST_SIMPLE_ENTITIES_CREATED } from './data/test-entity.data';
import { TestBaseEntity } from '../__fixtures__/test-base.entity';

export default class TestEntitySeeder implements Seeder {
  public async run(
    dataSource: DataSource,
  ): Promise<Partial<TestSimpleEntity[]>> {
      const created: Partial<TestSimpleEntity[]> = [];

      await dataSource.transaction(async (manager) => {
        created.push(...(await manager.save(TestSimpleEntity, TEST_SIMPLE_ENTITIES_CREATED)));
      });

      await dataSource.transaction(async (manager) => {
        created.push(...(await manager.save(TestBaseEntity, TEST_BASE_ENTITIES_CREATED)));
      });

      return created;
  }
}
