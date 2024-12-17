import chalk from 'chalk';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { APP_CONFIG_NAME, IConfigApp } from '@owl-app/lib-api-core/config';
import RbacSeeder from '@owl-app/lib-api-core/seeds/Rbac';
import createUserSeeder from '@owl-app/lib-api-core/seeds/User';

import { BootstrapModule } from '../app/bootstrap.module';

console.log(chalk.green('Running seeders...'));
console.log(chalk.green(`Environment: ${process.env.APP_ENV} \n`));

async function runSeeder() {
  const app = await NestFactory.create(BootstrapModule);
  const dataSource = app.get(DataSource);
  const configService = app.get(ConfigService);
  const { passwordBcryptSaltRounds } = configService.get<IConfigApp>(APP_CONFIG_NAME);

  await runSeeders(dataSource, {
    seedTracking: process.env.APP_ENV === 'dev',
    seeds: [RbacSeeder, createUserSeeder(passwordBcryptSaltRounds)],
  });

  await app.close();
}
runSeeder();
