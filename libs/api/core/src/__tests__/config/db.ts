import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { TestEntity } from '../fixtures/test.entity';

export function getDbConfig(): SqliteConnectionOptions {
  return {
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [
      TestEntity,
    ],
    synchronize: true,
    logging: false,
  }
}
