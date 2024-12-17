import { DynamicModule, Module, Global, LoggerService } from '@nestjs/common';
import { WinstonModuleOptions, WinstonModuleAsyncOptions } from './interfaces';
import {
  createNestWinstonLogger,
  createWinstonAsyncProviders,
  createWinstonProviders,
} from './winston-logger.providers';

@Global()
@Module({})
export class WinstonLoggerModule {
  public static forRoot(options: WinstonModuleOptions): DynamicModule {
    const providers = createWinstonProviders(options);

    return { module: WinstonLoggerModule, providers, exports: providers };
  }

  public static forRootAsync(options: WinstonModuleAsyncOptions): DynamicModule {
    const providers = createWinstonAsyncProviders(options);

    return {
      module: WinstonLoggerModule,
      imports: options.imports,
      providers,
      exports: providers,
    } as DynamicModule;
  }

  public static createLogger(options: WinstonModuleOptions): LoggerService {
    return createNestWinstonLogger(options);
  }
}
