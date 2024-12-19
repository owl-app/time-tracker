import { DataSource } from 'typeorm';
import { runSeeders, SeederConstructor } from 'typeorm-extension';

export async function dbSeeder(dataSource: DataSource, seeds: SeederConstructor[]) {
  await runSeeders(dataSource, {
    seedTracking: process.env.APP_ENV === 'dev',
    seeds,
  });
}
