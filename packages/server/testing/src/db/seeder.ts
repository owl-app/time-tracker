import { DataSource } from 'typeorm';
import { runSeeders, SeederConstructor, SeederFactoryItem } from 'typeorm-extension';
import { SeederRegistry, TestSeederRegistry } from './seeder.registry';

export async function dbSeeder(
  dataSource: DataSource,
  seeds: SeederConstructor[] = [],
  factories: SeederFactoryItem[] = []
): Promise<SeederRegistry> {
  return new TestSeederRegistry(
    await runSeeders(dataSource, {
      seeds,
      factories,
    })
  );
}
