import { bootstrap } from '@owl-app/testing';

import { JwtAuthGuard } from '@owl-app/lib-api-core/passport/jwt.guard';
import { RoutePermissionGuard } from '@owl-app/lib-api-core/rbac/guards/route-permission.guard';

import { SeederConstructor } from 'typeorm-extension';
import { INestApplication } from '@nestjs/common';
import { BootstrapModule } from './bootstrap.module';
import { getSeeds } from './config/seed';
import { getDbConfig } from './config/db';

export async function createTest(
  dbName: string,
  seeds: SeederConstructor[] = []
): Promise<INestApplication> {
  const app = await bootstrap({
    modules: [BootstrapModule.forFeature(dbName)],
    db: getDbConfig(dbName),
    getSeeds: getSeeds(seeds),
    guards: [JwtAuthGuard, RoutePermissionGuard],
    prefix: `${process.env.APP_API_PREFIX}/${process.env.APP_API_VERSION}`,
  });

  return app;
}
