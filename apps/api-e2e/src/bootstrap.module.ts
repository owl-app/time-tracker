import winston from 'winston';
import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService, registerAs } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { DatabaseModule } from '@owl-app/lib-api-core/database/database.module';
import {
  WinstonLoggerModule,
  WinstonModuleOptions,
  utilities as nestWinstonModuleUtilities,
} from '@owl-app/winston-logger-nestjs';
import config from '@owl-app/lib-api-core/config';
import { ErrorHandlersFilter } from '@owl-app/lib-api-core/filters/error-handlers.filter';

import { UserAccessModule } from '@owl-app/lib-api-module-user-access/user-access.module';
import { ClientModule } from '@owl-app/lib-api-module-client/client.module';
import { RequestContextModule } from '@owl-app/request-context-nestjs';
import { RbacModule } from '@owl-app/lib-api-module-rbac/rbac.module';
import { TimeTrackerModule } from '@owl-app/lib-api-module-time-tracker/time-tracker.module';
import { TagModule } from '@owl-app/lib-api-module-tag/tag.module';
import { ProjectModule } from '@owl-app/lib-api-module-project/project.module';
import { getDbConfig } from './config/db';

@Module({})
export class BootstrapModule implements BootstrapModule {
  static forFeature(dbName: string): DynamicModule {
    return {
      module: BootstrapModule,
      imports: [
        UserAccessModule,
        ClientModule,
        RbacModule,
        TimeTrackerModule,
        RequestContextModule,
        TagModule,
        ProjectModule,
        ConfigModule.forRoot({
          isGlobal: true,
          // this not work in nx
          envFilePath: [`.env.${process.env.NODE_ENV}`, `.env`],
          load: [...config, ...[
            registerAs('db', () => Object.assign(getDbConfig(dbName), { autoLoadEntities: true }))
          ]],
        }),
        DatabaseModule,
        WinstonLoggerModule.forRootAsync({
          useFactory: (configService: ConfigService): WinstonModuleOptions => ({
            transports: [
              new winston.transports.Console({
                format: winston.format.combine(
                  winston.format.timestamp(),
                  winston.format.ms(),
                  nestWinstonModuleUtilities.format.nestLike(configService.get('api.app_name'), {
                    colors: true,
                    prettyPrint: true,
                  })
                ),
              }),
            ],
          }),
          imports: [ConfigModule],
          inject: [ConfigService],
        }),
        EventEmitterModule.forRoot({
          ignoreErrors: true,
        }),
      ],
      providers: [
        {
          provide: APP_FILTER,
          useClass: ErrorHandlersFilter,
        },
      ],
    };
  }
}
