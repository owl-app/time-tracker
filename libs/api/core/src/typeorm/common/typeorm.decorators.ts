import { Inject } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { DEFAULT_DATA_SOURCE_NAME } from '../../contants';

import { getRepositoryToken } from './typeorm.utils';

export const InjectRepository = (
  entity: EntityClassOrSchema,
  dataSource: string = DEFAULT_DATA_SOURCE_NAME
): ReturnType<typeof Inject> => Inject(getRepositoryToken(entity, dataSource));
