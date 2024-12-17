import {
  DynamicModule,
  ForwardReference,
  InjectionToken,
  OptionalFactoryDependency,
} from '@nestjs/common';

import { Assembler } from './assemblers';
import { Class } from './common';
import { QueryService } from './services';

export interface NestjsQueryCoreModuleOpts {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  imports?: Array<Class<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assemblers?: NestjsQueryCoreModuleAssemblersOpts[];
}

export interface NestjsQueryCoreModuleAssemblersOpts {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  classAssembler: Class<Assembler<any, any, any, any, any, any>>;
  classService?: Class<QueryService<unknown>>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}
