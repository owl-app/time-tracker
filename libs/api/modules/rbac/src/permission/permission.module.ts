import { Module } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RbacTypeOrmModule } from '@owl-app/lib-api-core/rbac/rbac-typeorm.module';
import { AppNestjsQueryTypeOrmModule } from '@owl-app/lib-api-core/query/module';
import { BaseRepository } from '@owl-app/lib-api-core/database/repository/base.repository';

import { RbacPermissionCrudController } from './features/v1/crud/crud.http.controller';
import { ListFilterBuilder } from './features/v1/crud/list-filter.builder';
import { PermissionService } from './features/v1/crud/permission.service';
import { PermissionAssembler } from './features/v1/crud/permission.assembler';
import { PermissionEntitySchema } from '../database/entity-schema/permission.entity-schema';
import { BaseAuthEntitySchema } from '../database/entity-schema/base-auth.entity-schema';

@Module({
  imports: [
    RbacTypeOrmModule.forFeature(),
    TypeOrmModule.forFeature([BaseAuthEntitySchema]),
    AppNestjsQueryTypeOrmModule.forFeature({
      importsQueryTypeOrm: [RbacTypeOrmModule.forFeature()],
      entities: [
        {
          entity: PermissionEntitySchema,
          repository: BaseRepository,
          inject: [EventEmitter2],
          dataProvider: {
            filterBuilder: ListFilterBuilder,
          },
          assembler: {
            classAssembler: PermissionAssembler,
          },
        },
      ],
      queryService: {
        classService: PermissionService,
        inject: ['RBAC_MANAGER'],
      },
    }),
  ],
  controllers: [RbacPermissionCrudController],
})
export class RbacPermissionModule {}
