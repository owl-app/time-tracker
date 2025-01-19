import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { TestSimpleEntity } from '../__fixtures__/test-simple.entity';
import { TestBaseEntity } from '../__fixtures__/test-base.entity';

export function getDbConfig(): SqliteConnectionOptions {
  return {
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [
      TestSimpleEntity,
      TestBaseEntity,
    ],
    synchronize: true,
    logging: false,
  }
}
