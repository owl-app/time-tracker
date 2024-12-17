import { Module } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CqrsModule } from '@nestjs/cqrs';

import { AppNestjsQueryTypeOrmModule } from '@owl-app/lib-api-core/query/module';
import { BaseRepository } from '@owl-app/lib-api-core/database/repository/base.repository';
import { AppAssemblerQueryService } from '@owl-app/lib-api-core/query/core/services/app-assembler-query.service';

import { TimeEntitySchema } from './database/entity-schema/time.entity-schema';

import { TimeCrudController } from './time/features/v1/crud/crud.http.controller';
import { TimeAssembler } from './time/assembler/time.assembler';
import { ListFilterBuilder } from './time/features/v1/crud/list-filter.builder';
import { StopWathController } from './time/features/v1/stopwatch/stopwatch.http.controller';
import { ContinueWatchHandler } from './time/features/v1/stopwatch/continue-watch.service';
import { InProgressController } from './time/features/v1/in-progress/in-progress.http.controller';
import { ExportController } from './time/features/v1/export/export.http.controller';
import { CsvGenerator } from './time/features/v1/export/csv.generator';

@Module({
  imports: [
    CqrsModule,
    AppNestjsQueryTypeOrmModule.forFeature({
      entities: [
        {
          entity: TimeEntitySchema,
          repository: BaseRepository,
          inject: [EventEmitter2],
          dataProvider: {
            filterBuilder: ListFilterBuilder,
          },
          assembler: {
            classService: AppAssemblerQueryService,
            classAssembler: TimeAssembler,
          },
        },
      ],
    }),
  ],
  controllers: [ExportController, StopWathController, InProgressController, TimeCrudController],
  providers: [CsvGenerator, ContinueWatchHandler],
})
export class TimeTrackerModule {}
