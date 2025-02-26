import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { TestSimpleEntity } from '../__fixtures__/test-simple.entity';
import {
  TEST_BASE_ENTITIES_CREATED,
  TEST_SIMPLE_ENTITIES_CREATED,
} from './data/tes-base-entity.data';
import { TestBaseEntity } from '../__fixtures__/test-base.entity';
import { TestBaseRelation } from '../__fixtures__/test-base-relation.entity';
import {
  TEST_BASE_RELATION_ASSIGNED,
  TEST_BASE_RELATION_CREATED,
} from './data/test-base-relation.data';

export default class TestEntitySeeder implements Seeder {
  public async run(
    dataSource: DataSource
  ): Promise<Partial<TestSimpleEntity | TestBaseEntity | TestBaseRelation>[]> {
    const created: Partial<TestSimpleEntity | TestBaseEntity | TestBaseRelation>[] = [];

    await dataSource.transaction(async (manager) => {
      created.push(...(await manager.save(TestBaseRelation, TEST_BASE_RELATION_ASSIGNED)));
    });

    await dataSource.transaction(async (manager) => {
      created.push(...(await manager.save(TestSimpleEntity, TEST_SIMPLE_ENTITIES_CREATED)));
    });

    await dataSource.transaction(async (manager) => {
      created.push(...(await manager.save(TestBaseEntity, TEST_BASE_ENTITIES_CREATED)));
    });

    await dataSource.transaction(async (manager) => {
      created.push(...(await manager.save(TestBaseRelation, TEST_BASE_RELATION_CREATED)));
    });

    return created;
  }
}
