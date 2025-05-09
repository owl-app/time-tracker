import chalk from 'chalk';
import { DatabaseType, DataSource, DataSourceOptions } from 'typeorm';
import { createDatabase, runSeeders } from 'typeorm-extension';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { APP_CONFIG_NAME, IConfigApp } from '@owl-app/lib-api-core/config';
import { RoleSeeder } from '@owl-app/lib-api-core/seeds/role';
import { PermissionSeeder } from '@owl-app/lib-api-core/seeds/permission';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import createUserSeeder from '@owl-app/lib-api-core/seeds/user';

import { BootstrapModule } from '../app/bootstrap.module';

console.log(chalk.green('Running seeders...'));
console.log(chalk.green(`Environment: ${process.env.APP_ENV} \n`));

async function runSeeder() {
  await createDatabaseIfNotExist();

  const app = await NestFactory.create(BootstrapModule);
  const dataSource = app.get(DataSource);
  const configService = app.get(ConfigService);
  const { passwordBcryptSaltRounds } = configService.get<IConfigApp>(APP_CONFIG_NAME);

  await runSeeders(dataSource, {
    seedTracking: process.env.APP_ENV === 'dev',
    seeds: [PermissionSeeder, RoleSeeder, createUserSeeder(dataUsers, passwordBcryptSaltRounds)],
  });

  await app.close();
}

async function createDatabaseIfNotExist() {
  await createDatabase({
    ifNotExist: true,
    synchronize: true,
    options: {
      type: (process.env.DB_TYPE as DatabaseType) || 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
    } as DataSourceOptions,
  });
}

runSeeder();
