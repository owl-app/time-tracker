import { DynamicModule } from '@nestjs/common';

import { createServices } from './providers';
import { NestjsQueryCoreModuleOpts } from './types';

export class NestjsQueryCoreModule {
  static forFeature(opts: NestjsQueryCoreModuleOpts): DynamicModule {
    const { imports = [], assemblers = [] } = opts;
    const assemblerServiceProviders = createServices(assemblers);

    const assemblersProviders = assemblers.map((opt) => opt.classAssembler);

    return {
      module: NestjsQueryCoreModule,
      imports: [...imports],
      providers: [...assemblersProviders, ...assemblerServiceProviders],
      exports: [...imports, ...assemblersProviders, ...assemblerServiceProviders],
    };
  }
}
