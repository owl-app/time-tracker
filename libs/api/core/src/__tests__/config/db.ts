import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { TestSimpleEntity } from '../__fixtures__/test-simple.entity';
import { TestDomainEntity } from '../__fixtures__/test-domain.entity';

export function getDbConfig(): SqliteConnectionOptions {
  return {
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [
      TestSimpleEntity,
      TestDomainEntity,
    ],
    synchronize: true,
    logging: false,
  }
}
