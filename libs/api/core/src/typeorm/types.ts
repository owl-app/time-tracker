import { ObjectLiteral, Repository } from 'typeorm';
import {
  DynamicModule,
  ForwardReference,
  InjectionToken,
  OptionalFactoryDependency,
} from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { Class } from '@owl-app/nestjs-query-core';

export interface AppTypeOrmEntitesOpts {
  entity: EntityClassOrSchema;
  repository?: Class<Repository<ObjectLiteral>>;
  repositoryToken?: string;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}

export interface AppTypeOrmOpts {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  imports?: Array<Class<unknown> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
  entities: AppTypeOrmEntitesOpts[];
}
