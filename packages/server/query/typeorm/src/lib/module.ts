import { ObjectLiteral, Repository } from 'typeorm';
import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Class } from '@owl-app/nestjs-query-core';
import { isObject } from '@owl-app/utils';

import { createTypeOrmQueryServiceProviders } from './providers';
import type { NestjsQueryTypeOrmModuleOpts } from './types';

export class NestjsQueryTypeOrmModule {
  static forFeature(opts: NestjsQueryTypeOrmModuleOpts): DynamicModule {
    const entities = opts.entities.map((opt) => opt.entity);
    const repositoriesProviders = opts.entities
      .filter(
        (opt) =>
          isObject(opt?.repository?.obj) &&
          opt?.repository?.obj &&
          opt?.repository?.injectInProviders
      )
      .map((opt) => opt.repository.obj) as unknown as Class<Repository<ObjectLiteral>>[];

    const queryServiceProviders = createTypeOrmQueryServiceProviders(
      opts.entities,
      opts.connection,
      opts.queryService
    );

    const typeOrmModule = opts.typeOrmModule ?? TypeOrmModule.forFeature(entities, opts.connection);

    return {
      imports: [typeOrmModule, ...(opts.imports ?? [])],
      module: NestjsQueryTypeOrmModule,
      providers: [...queryServiceProviders, ...repositoriesProviders],
      exports: [...queryServiceProviders, typeOrmModule],
    };
  }
}
