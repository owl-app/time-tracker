import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { RbacTypeOrmModule } from '@owl-app/lib-api-core/rbac/rbac-typeorm.module';
import { AppNestjsQueryTypeOrmModule } from '@owl-app/lib-api-core/query/module';
import { AppAssemblerQueryService } from '@owl-app/lib-api-core/query/core/services/app-assembler-query.service';

import { UserEntitySchema } from '../database/entity-schema/user.entity-schema';
import { UserRepository } from '../database/repository/user.repository';

import { UserCrudController } from './features/v1/crud/crud.http.controller';
import { AssignAccessController } from './features/v1/assing-access/assign-access.http.controller';
import { UserAssembler } from './features/v1/crud/user.assembler';
import { ListFilterBuilder } from './features/v1/crud/list-filter.builder';
import { RegistrationController } from './features/v1/registration/registration.http.controller';
import { RegistrationHandler } from './features/v1/registration/registration.service';
import { UserPermissionsController } from './features/v1/permissions/user-permisssions.http.controller';
import { ProfileAssembler } from './features/v1/profile/profile.assembler';
import { ProfileController } from './features/v1/profile/profile.http.controller';

@Module({
  imports: [
    CqrsModule,
    RbacTypeOrmModule.forFeature({}),
    AppNestjsQueryTypeOrmModule.forFeature({
      entities: [
        {
          entity: UserEntitySchema,
          repository: UserRepository,
          inject: [EventEmitter2],
          dataProvider: {
            filterBuilder: ListFilterBuilder,
          },
          assembler: {
            classService: AppAssemblerQueryService,
            classAssembler: UserAssembler,
          },
        },
        {
          entity: UserEntitySchema,
          repository: UserRepository,
          inject: [EventEmitter2],
          assembler: {
            classService: AppAssemblerQueryService,
            classAssembler: ProfileAssembler,
          },
        },
      ],
    }),
  ],
  controllers: [
    UserCrudController,
    AssignAccessController,
    RegistrationController,
    UserPermissionsController,
    ProfileController,
  ],
  providers: [RegistrationHandler],
})
export class UserModule {}
