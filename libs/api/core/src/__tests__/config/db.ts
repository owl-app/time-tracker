import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { TestSimpleEntity } from '../__fixtures__/test-simple.entity';
import { TestBaseEntity } from '../__fixtures__/test-base.entity';
import { TenantEntity } from '../__fixtures__/tenant.entity';
import { TestBaseRelation } from '../__fixtures__/test-base-relation.entity';

export function getDbConfig(): SqliteConnectionOptions {
  return {
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [TestSimpleEntity, TestBaseEntity, TestBaseRelation, TenantEntity],
    synchronize: true,
    logging: false,
  };
}
