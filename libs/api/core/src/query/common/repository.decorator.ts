import { Inject } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { DEFAULT_DATA_SOURCE_NAME } from '../../contants';

import { getQueryServiceRepositoryToken } from './repository.utils';

export const InjectQueryServiceRepository = (
  entity: EntityClassOrSchema,
  dataSource: string = DEFAULT_DATA_SOURCE_NAME
): ReturnType<typeof Inject> => Inject(getQueryServiceRepositoryToken(entity, dataSource));
