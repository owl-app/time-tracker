import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { TestEntity } from '../fixtures/test.entity';

export default class TestEntitySeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<Partial<TestEntity[]>> {
    const userFactory = await factoryManager.get(TestEntity);

    const created = await userFactory.saveMany(10)

    return created;
  }
}
