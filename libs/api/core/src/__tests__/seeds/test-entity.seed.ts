import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { TestSimpleEntity } from '../__fixtures__/test-simple.entity';

export default class TestEntitySeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<Partial<TestSimpleEntity[]>> {
    const userFactory = await factoryManager.get(TestSimpleEntity);

    const created = await userFactory.saveMany(10)

    return created;
  }
}
