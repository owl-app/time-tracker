import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederConstructor, SeederFactoryItem } from 'typeorm-extension';
import { urlencoded, json } from 'express';
import cookieParser from 'cookie-parser';

import {
  CanActivate,
  ClassSerializerInterceptor,
  DynamicModule,
  ForwardReference,
  INestApplication,
  Provider,
  Type,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { Class } from '@owl-app/types';

import { dbInitializer } from './db/initializer';
import { dbSeeder } from './db/seeder';
import { SeederRegistry } from './db/seeder.registry';

export interface SeedOptions {
  seeds: (configService: ConfigService) => SeederConstructor[];
  factories: (configService: ConfigService) => SeederFactoryItem[];
}

export interface BootstrapOptions {
  modules: Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
  db: DataSourceOptions;
  seed: SeedOptions;
  guards?: Class<CanActivate>[];
  prefix?: string;
  providers?: Provider[];
}

export async function bootstrap(options: BootstrapOptions): Promise<[INestApplication, SeederRegistry]> {
  await dbInitializer(options.db);

  const moduleRef = await Test.createTestingModule({
    imports: options.modules,
    providers: options.providers ?? [],
  }).compile();

  const app = moduleRef.createNestApplication({
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  const configService = app.get(ConfigService);

  const seederRegistry = await dbSeeder(
    app.get(DataSource),
    options?.seed?.seeds(configService) ?? [],
    options?.seed?.factories(configService) ?? []
  );

  if (options.prefix) {
    app.setGlobalPrefix(options.prefix);
  }

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

  options?.guards?.forEach((Guard) => app.useGlobalGuards(new Guard(reflector)));

  await app.init();

  return [app, seederRegistry];
}
