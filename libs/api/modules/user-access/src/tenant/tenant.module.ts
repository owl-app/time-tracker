import { Module } from '@nestjs/common';

import { WinstonLoggerModule } from '@owl-app/winston-logger-nestjs';

import { AppTypeOrmModule } from '@owl-app/lib-api-core/typeorm/app-typeorm.module';
import { InjectableRepository } from '@owl-app/lib-api-core/database/repository/injectable.repository';

import { TenantEntitySchema } from '../database/entity-schema/tenant.entity-schema';

import { CreateTenantWhenUserIsRegisteredDomainEventHandler } from './event-handlers/create-tenant-when-user-is-registered.domain-event-handler';

@Module({
  imports: [
    WinstonLoggerModule,
    AppTypeOrmModule.forFeature({
      entities: [
        {
          entity: TenantEntitySchema,
          repository: InjectableRepository,
        },
      ],
    }),
  ],
  controllers: [],
  providers: [CreateTenantWhenUserIsRegisteredDomainEventHandler],
})
export class TenantModule {}
