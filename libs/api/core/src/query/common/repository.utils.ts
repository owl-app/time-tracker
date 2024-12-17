import { DataSource, DataSourceOptions, EntitySchema } from 'typeorm';
import { getDataSourcePrefix } from '@nestjs/typeorm';
import { Type } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { DEFAULT_DATA_SOURCE_NAME } from '../../contants';

export function getQueryServiceRepositoryToken(
  entity: EntityClassOrSchema,
  dataSource: DataSource | DataSourceOptions | string = DEFAULT_DATA_SOURCE_NAME
): string | Type<DataSource> {
  const dataSourcePrefix = getDataSourcePrefix(dataSource) || '';

  if (entity instanceof EntitySchema) {
    return `${dataSourcePrefix}${
      entity.options.target ? entity.options.target.name : entity.options.name
    }QueryServiceRepository`;
  }
  return `${dataSourcePrefix}${entity.name}QueryServiceRepository`;
}
