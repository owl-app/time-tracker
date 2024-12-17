import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';

import { RbacTypeOrmModule } from '@owl-app/lib-api-core/rbac/rbac-typeorm.module';
import { AppNestjsQueryTypeOrmModule } from '@owl-app/lib-api-core/query/module';
import { BaseRepository } from '@owl-app/lib-api-core/database/repository/base.repository';
import { FILTER_REGISTRY_TENANT } from '@owl-app/lib-api-core/registry/constants';

import { CrudController } from './features/v1/crud/crud.http.controller';
import { AssignController } from './features/v1/assign/assign.http.controller';
import { RevokeController } from './features/v1/revoke/revoke.http.controller';
import { RoleEntitySchema } from '../database/entity-schema/role.entity-schema';
import { ListFilterBuilder } from './features/v1/crud/list-filter.builder';
import { RoleSettingEntitySchema } from '../database/entity-schema/role-setting.entity-schema';
import { RoleService } from './features/v1/crud/role.service';
import { RoleAssembler } from './features/v1/crud/role.assembler';
import { BaseAuthEntitySchema } from '../database/entity-schema/base-auth.entity-schema';
import { AssignedPermissionsController } from './features/v1/assigned-permissions/assigned-permissions.http.controller';

@Module({
  imports: [
    RbacTypeOrmModule.forFeature(),
    TypeOrmModule.forFeature([BaseAuthEntitySchema, RoleSettingEntitySchema]),
    AppNestjsQueryTypeOrmModule.forFeature({
      importsQueryTypeOrm: [RbacTypeOrmModule.forFeature()],
      entities: [
        {
          entity: RoleEntitySchema,
          repository: BaseRepository,
          inject: [EventEmitter2],
          dataProvider: {
            filterBuilder: ListFilterBuilder,
          },
          assembler: {
            classAssembler: RoleAssembler,
          },
        },
      ],
      queryService: {
        classService: RoleService,
        inject: [DataSource, 'RBAC_MANAGER', FILTER_REGISTRY_TENANT],
      },
    }),
  ],
  controllers: [CrudController, AssignedPermissionsController, AssignController, RevokeController],
})
export class RbacRoleModule {}
