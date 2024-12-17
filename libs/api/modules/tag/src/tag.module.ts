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

import { TagEntitySchema } from './database/entity-schema/tag.entity-schema';

import { TagCrudController } from './tag/features/v1/crud/crud.http.controller';
import { TagAssembler } from './tag/features/v1/crud/tag.assembler';
import { ListFilterBuilder } from './tag/features/v1/crud/list-filter.builder';
import { ArchiveControllerController } from './tag/features/v1/archive/archive.http.controller';
import { TagEntity } from './domain/entity/tag.entity';

@Module({
  imports: [
    AppTypeOrmModule.forFeature({
      entities: [
        {
          entity: TagEntitySchema,
          repository: InjectableRepository,
        },
      ],
    }),
    AppNestjsQueryTypeOrmModule.forFeature({
      entities: [
        {
          entity: TagEntitySchema,
          repository: BaseRepository,
          inject: [EventEmitter2],
          dataProvider: {
            filterBuilder: ListFilterBuilder,
          },
          assembler: {
            classService: AppAssemblerQueryService,
            classAssembler: TagAssembler,
          },
        },
      ],
    }),
  ],
  controllers: [TagCrudController, ArchiveControllerController],
  providers: [
    {
      provide: ArchiveService,
      useFactory: (repository: InjectableRepository<TagEntity>) =>
        new DefaultArchiveService(repository),
      inject: [getRepositoryToken(TagEntitySchema)],
    },
  ],
})
export class TagModule {}
