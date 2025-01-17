import { DataSource } from 'typeorm';
import { SeederConstructor, SeederFactoryItem } from 'typeorm-extension';

import { truncateDatabase } from './truncate';
import { dbSeeder } from './seeder';
import { SeederRegistry } from './seeder.registry';

export type DatabaseRefreshOptions = {
  dataSource: DataSource,
  seeds?: SeederConstructor[],
  factories?: SeederFactoryItem[]
}

export async function dbRefresh(options: DatabaseRefreshOptions): Promise<SeederRegistry> {
  if (!options.dataSource) {
    throw new Error('Options dataSource is required');
  }

  await truncateDatabase(options.dataSource.options);

  const seederRegistry = await dbSeeder(
    options.dataSource,
    options.seeds ?? [],
    options.factories ?? []
  );

  return seederRegistry;
}
