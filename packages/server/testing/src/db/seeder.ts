import { DataSource } from 'typeorm';
import { runSeeders, SeederConstructor, SeederFactoryItem } from 'typeorm-extension';
import { Context } from '../context';

export async function dbSeeder(
  dataSource: DataSource,
  context: Context,
  seeds: SeederConstructor[],
  factories?: SeederFactoryItem[]
) {
  context.addSeederEntity(
    await runSeeders(dataSource, {
      seedTracking: process.env.APP_ENV === 'dev',
      seeds,
      factories,
    })
  );
}
