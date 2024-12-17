import { bootstrap } from '@owl-app/testing';

import { SeederConstructor } from 'typeorm-extension';
import { INestApplication } from '@nestjs/common';
import { BootstrapModule } from './bootstrap.module';
import { getSeeds } from './config/seed';
import { getDbConfig } from './config/db';

export async function createTest(
  dbName: string,
  seeds: SeederConstructor[] = []
): Promise<INestApplication> {
  const app = await bootstrap(
    [BootstrapModule.forFeature(dbName)],
    getDbConfig(dbName),
    getSeeds(seeds)
  );

  return app;
}
