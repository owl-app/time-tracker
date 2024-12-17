import { Module } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AppNestjsQueryTypeOrmModule } from '@owl-app/lib-api-core/query/module';
import { AppTypeOrmModule } from '@owl-app/lib-api-core/typeorm/app-typeorm.module';
import {
  ArchiveService,
  DefaultArchiveService,
} from '@owl-app/lib-api-core/actions/archive/archive.service';
import { InjectableRepository } from '@owl-app/lib-api-core/database/repository/injectable.repository';
import { BaseRepository } from '@owl-app/lib-api-core/database/repository/base.repository';
import { getRepositoryToken } from '@owl-app/lib-api-core/typeorm/common/typeorm.utils';
import { AppAssemblerQueryService } from '@owl-app/lib-api-core/query/core/services/app-assembler-query.service';

import { ProjectEntitySchema } from './database/entity-schema/project.entity-schema';

import { ProjectCrudController } from './project/features/v1/crud/crud.http.controller';
import { ProjectAssembler } from './project/features/v1/crud/project.assembler';
import { ListFilterBuilder } from './project/features/v1/crud/list-filter.builder';
import { ArchiveControllerController } from './project/features/v1/archive/archive.http.controller';
import { ProjectEntity } from './domain/entity/project.entity';
import { ArchiveProjectsWhenClientIsArchivedDomainEventHandler } from './project/event-handlers/archive-projects-when-client-is-archived.domain-event-handler';

@Module({
  imports: [
    AppTypeOrmModule.forFeature({
      entities: [
        {
          entity: ProjectEntitySchema,
          repository: InjectableRepository,
        },
      ],
    }),
    AppNestjsQueryTypeOrmModule.forFeature({
      entities: [
        {
          entity: ProjectEntitySchema,
          repository: BaseRepository,
          inject: [EventEmitter2],
          dataProvider: {
            filterBuilder: ListFilterBuilder,
          },
          assembler: {
            classService: AppAssemblerQueryService,
            classAssembler: ProjectAssembler,
          },
        },
      ],
    }),
  ],
  controllers: [ProjectCrudController, ArchiveControllerController],
  providers: [
    ArchiveProjectsWhenClientIsArchivedDomainEventHandler,
    {
      provide: ArchiveService,
      useFactory: (repository: InjectableRepository<ProjectEntity>) =>
        new DefaultArchiveService(repository),
      inject: [getRepositoryToken(ProjectEntitySchema)],
    },
  ],
})
export class ProjectModule {}
