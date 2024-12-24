import { SeederConstructor, SeederFactoryItem } from 'typeorm-extension';

import { TestServer } from '@owl-app/testing';

import { JwtAuthGuard } from '@owl-app/lib-api-core/passport/jwt.guard';
import { RoutePermissionGuard } from '@owl-app/lib-api-core/rbac/guards/route-permission.guard';

import { BootstrapModule } from './bootstrap.module';
import { getSeeds, getFactoriesSeeds } from './config/seed';
import { getDbConfig } from './config/db';

export interface CreateTestOptions {
  dbName: string;
  seeds?: SeederConstructor[];
  factories?: SeederFactoryItem[];
}

export async function createTest(options: CreateTestOptions): Promise<TestServer> {
  const testServer = await TestServer.start({
    modules: [BootstrapModule.forFeature(options.dbName)],
    db: getDbConfig(options.dbName),
    seed: {
      seeds: getSeeds(options?.seeds),
      factories: getFactoriesSeeds(options?.factories),
    },
    guards: [JwtAuthGuard, RoutePermissionGuard],
    prefix: `${process.env.APP_API_PREFIX}/${process.env.APP_API_VERSION}`,
  });

  return testServer;
}
