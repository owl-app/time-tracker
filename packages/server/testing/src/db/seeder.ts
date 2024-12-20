import { DataSource } from 'typeorm';
import { runSeeders, SeederConstructor, SeederFactoryItem } from 'typeorm-extension';

export async function dbSeeder(
  dataSource: DataSource,
  seeds: SeederConstructor[],
  factories?: SeederFactoryItem[]
) {
  await runSeeders(dataSource, {
    seedTracking: process.env.APP_ENV === 'dev',
    seeds,
    factories,
  });
}
