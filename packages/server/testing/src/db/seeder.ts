import { DataSource } from 'typeorm';
import { runSeeders, SeederConstructor, SeederFactoryItem } from 'typeorm-extension';
import { Context } from '../context';

export async function dbSeeder(
  dataSource: DataSource,
  context: Context,
  seeds: SeederConstructor[],
  factories?: SeederFactoryItem[]
) {
  const exexuted = await runSeeders(dataSource, {
    seedTracking: process.env.APP_ENV === 'dev',
    seeds,
    factories,
  });

  exexuted.forEach((seed) => {
    if (Array.isArray(seed.result)) {
      const resultSeed: unknown[] = []

      seed.result.forEach((result) => {
        resultSeed.push(result);
      });

      context.addResultSeed(seed.name, resultSeed);
    } else {
      context.addResultSeed(seed.name, seed.result);
    }
  });
}
