import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModule as BaseTypeOrmModule } from '@nestjs/typeorm';
import { DynamicModule, Module } from '@nestjs/common';

import { AppTypeOrmOpts } from './types';
import { DEFAULT_DATA_SOURCE_NAME } from '../contants';
import { createAppTypeOrmProviders } from './app-typeorm.providers';

@Module({})
export class TypeOrmModule {
  static forFeature(
    opts: AppTypeOrmOpts,
    dataSource: DataSource | DataSourceOptions | string = DEFAULT_DATA_SOURCE_NAME
  ): DynamicModule {
    const providers = createAppTypeOrmProviders(opts.entities, dataSource);
    const entities = opts.entities.map((entity) => entity.entity);

    const baseTypeOrmModule = BaseTypeOrmModule.forFeature(entities, dataSource);

    return {
      imports: [baseTypeOrmModule, ...(opts.imports ?? [])],
      module: TypeOrmModule,
      providers,
      exports: [baseTypeOrmModule, ...providers],
    };
  }
}
