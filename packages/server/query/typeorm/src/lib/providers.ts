/* eslint-disable new-cap */
import type { DataSource, Repository } from 'typeorm';

import { FactoryProvider } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { Class } from '@owl-app/nestjs-query-core';

import { isObject } from '@owl-app/utils';

import { TypeOrmQueryService } from './services';
import { getQueryServiceToken } from './decorators';
import type {
  NestjsQueryTypeOrmModuleEntitiesOpts,
  NestjsQueryTypeOrmModuleEntitiesRepositoryOpts,
  NestjsQueryTypeOrmModuleQueryServiceOpts,
} from './types';

export function createTypeOrmQueryServiceProvider<Entity>(
  entity: EntityClassOrSchema,
  repository?: NestjsQueryTypeOrmModuleEntitiesRepositoryOpts,
  connection?: DataSource | string,
  queryService?: NestjsQueryTypeOrmModuleQueryServiceOpts
): FactoryProvider {
  const { obj: RepositoryObj, injectInProviders = false } = repository ?? {};

  const { classService = TypeOrmQueryService, inject = [], opts = {} } = queryService ?? {};

  return {
    provide: getQueryServiceToken(entity),
    useFactory(baseRepo: Repository<Entity>, ...injectArgs) {
      if (isObject(RepositoryObj) && !injectInProviders) {
        const RepositoryClass = RepositoryObj as new (
          repo: Repository<Entity>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) => any;

        return new classService(new RepositoryClass(baseRepo), opts, ...injectArgs);
      }

      return new classService(baseRepo, opts, ...injectArgs);
    },
    inject: [
      injectInProviders ? RepositoryObj : getRepositoryToken(entity, connection),
      ...(inject ?? []),
    ],
  };
}

export const createTypeOrmQueryServiceProviders = (
  entities: NestjsQueryTypeOrmModuleEntitiesOpts[],
  connection?: DataSource | string,
  queryService?: NestjsQueryTypeOrmModuleQueryServiceOpts
): FactoryProvider[] =>
  entities.map((entity) =>
    createTypeOrmQueryServiceProvider(entity.entity, entity.repository, connection, queryService)
  );
