import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { RbacTypeOrmModule } from '@owl-app/lib-api-core/rbac/rbac-typeorm.module';
import { AppNestjsQueryTypeOrmModule } from '@owl-app/lib-api-core/query/module';
import { AppAssemblerQueryService } from '@owl-app/lib-api-core/query/core/services/app-assembler-query.service';
import { AppTypeOrmModule } from '@owl-app/lib-api-core/typeorm/app-typeorm.module';
import { BaseRepository } from '@owl-app/lib-api-core/database/repository/base.repository';
import {
  ArchiveService,
  DefaultArchiveService,
} from '@owl-app/lib-api-core/actions/archive/archive.service';
import { InjectableRepository } from '@owl-app/lib-api-core/database/repository/injectable.repository';
import { getRepositoryToken } from '@owl-app/lib-api-core/typeorm/common/typeorm.utils';

import { ClientEntitySchema } from './database/entity-schema/client.entity-schema';

import { ClientCrudController } from './client/features/v1/crud/crud.http.controller';
import { ClientAssembler } from './client/features/v1/crud/client.assembler';
import { ListFilterBuilder } from './client/features/v1/crud/list-filter.builder';
import { ClientEntity } from './domain/entity/client.entity';
import { ArchiveControllerController } from './client/features/v1/archive/archive.http.controller';

@Module({
  imports: [
    RbacTypeOrmModule.forFeature({}),
    CqrsModule,
    AppTypeOrmModule.forFeature({
      entities: [
        {
          entity: ClientEntitySchema,
          repository: InjectableRepository,
        },
      ],
    }),
    AppNestjsQueryTypeOrmModule.forFeature({
      entities: [
        {
          entity: ClientEntitySchema,
          repository: BaseRepository,
          inject: [EventEmitter2],
          dataProvider: {
            filterBuilder: ListFilterBuilder,
          },
          assembler: {
            classService: AppAssemblerQueryService,
            classAssembler: ClientAssembler,
          },
        },
      ],
    }),
  ],
  controllers: [ClientCrudController, ArchiveControllerController],
  providers: [
    {
      provide: ArchiveService,
      useFactory: (repository: InjectableRepository<ClientEntity>) =>
        new DefaultArchiveService(repository),
      inject: [getRepositoryToken(ClientEntitySchema)],
    },
  ],
})
export class ClientModule {}
