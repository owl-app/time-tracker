import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederConstructor } from 'typeorm-extension';
import { urlencoded, json } from 'express';
import cookieParser from 'cookie-parser';

import {
  ClassSerializerInterceptor,
  DynamicModule,
  ForwardReference,
  INestApplication,
  Type,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { APP_CONFIG_NAME, IConfigApp } from '@owl-app/lib-api-core/config';
import { JwtAuthGuard } from '@owl-app/lib-api-core/passport/jwt.guard';
import { RoutePermissionGuard } from '@owl-app/lib-api-core/rbac/guards/route-permission.guard';

import { dbInitializer } from './db/initializer';
import { dbSeeder } from './db/seeder';

export async function bootstrap(
  modules: Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>,
  dbOptions: DataSourceOptions,
  getSeeds: (configService: ConfigService) => SeederConstructor[]
): Promise<INestApplication> {
  await dbInitializer(dbOptions);

  const moduleRef = await Test.createTestingModule({
    imports: modules,
  }).compile();

  const app = moduleRef.createNestApplication({
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  const configService = app.get(ConfigService);
  const { version, prefix } = configService.get<IConfigApp>(APP_CONFIG_NAME);
  const globalPrefix = `${prefix}/${version}`;

  await dbSeeder(app.get(DataSource), getSeeds(configService));

  app.setGlobalPrefix(globalPrefix);

  const allowedHeaders = [
    'Authorization',
    'Language',
    'X-Requested-With',
    'X-Auth-Token',
    'X-HTTP-Method-Override',
    'Content-Type',
    'Content-Language',
    'Accept',
    'Accept-Language',
    'Observe',
    'Set-Cookie',
    'Access-Control-Allow-Origin',
    'Referer',
  ];

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
    allowedHeaders: allowedHeaders.join(','),
  });

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalGuards(new RoutePermissionGuard(reflector));

  await app.init();

  return app;
}
