import { Provider } from '@nestjs/common';

import { Assembler, getAssemblerClasses } from './assemblers';
import { getQueryServiceToken } from './decorators';
import { getAssemblerQueryServiceToken } from './decorators/helpers';
import { AssemblerQueryService, QueryService } from './services';
import { NestjsQueryCoreModuleAssemblersOpts } from './types';

function createServiceProvider<DTO, Entity, C, CE, U, UE>(
  opts: NestjsQueryCoreModuleAssemblersOpts
): Provider {
  const classes = getAssemblerClasses(opts.classAssembler);
  if (!classes) {
    throw new Error(
      `unable to determine DTO and Entity classes for ${opts.classAssembler.name}. Did you decorate your class with @Assembler`
    );
  }
  const { EntityClass } = classes;

  const { classService = AssemblerQueryService, inject = [] } = opts ?? {};

  return {
    provide: getAssemblerQueryServiceToken(opts.classAssembler),
    useFactory(
      assembler: Assembler<DTO, Entity, C, CE, U, UE>,
      entityService: QueryService<Entity, CE, UE>,
      ...injectArgs
    ) {
      /* eslint-disable new-cap */
      return new classService(assembler, entityService, ...injectArgs);
    },
    inject: [opts.classAssembler, getQueryServiceToken(EntityClass), ...inject],
  };
}

// eslint-disable-next-line import/prefer-default-export
export const createServices = (opts: NestjsQueryCoreModuleAssemblersOpts[]): Provider[] =>
  opts.map((opt) => createServiceProvider(opt));
