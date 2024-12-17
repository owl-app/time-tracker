import { DataSource, DataSourceOptions, ObjectLiteral } from 'typeorm';
import { DynamicModule, Module } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Archivable, Role, TenantAware, User, UserAware } from '@owl-app/lib-contracts';
import { RegistryServiceModule } from '@owl-app/registry-nestjs';

import { AppTypeOrmOpts } from './types';
import { DEFAULT_DATA_SOURCE_NAME } from '../contants';
import { TypeOrmModule } from './typeorm.module';

import { FILTER_REGISTRY_TENANT, SETTER_REGISTRY_TENANT } from '../registry/constants';
import { TenantRelationFilter } from './filters/tenant-relation.filter';
import { FilterQuery } from '../registry/interfaces/filter-query';
import { TenantRelationSetter } from './setters/tenant-relation.setter';
import { EntitySetter } from '../registry/interfaces/entity-setter';
import { RolesFilter } from './filters/roles.filter';
import { NonArchivedFilter } from './filters/non-archived.filter';
import { OwnerRelationSetter } from './setters/owner-relation.setter';
import { OwnerRelationFilter } from './filters/owner-relation.filter';
import { UserListFilter } from './filters/user-list.filter';

@Module({})
export class AppTypeOrmModule {
  static forFeature(
    opts: AppTypeOrmOpts,
    dataSource: DataSource | DataSourceOptions | string = DEFAULT_DATA_SOURCE_NAME
  ): DynamicModule {
    const optsWithRegistries = opts.entities.map((entity) => ({
      ...entity,
      inject: [FILTER_REGISTRY_TENANT, SETTER_REGISTRY_TENANT, EventEmitter2],
    }));

    const newOptions = {
      opts,
      entities: optsWithRegistries,
      imports: [
        RegistryServiceModule.forFeature<FilterQuery<ObjectLiteral>>({
          name: FILTER_REGISTRY_TENANT,
          services: {
            tenant: TenantRelationFilter<TenantAware>,
            roles: RolesFilter<Role>,
            archived: NonArchivedFilter<Archivable>,
            user: OwnerRelationFilter<UserAware>,
            user_list: UserListFilter<User>,
          },
        }),
        RegistryServiceModule.forFeature<EntitySetter<ObjectLiteral>>({
          name: SETTER_REGISTRY_TENANT,
          services: {
            tenant: TenantRelationSetter<TenantAware>,
            user: OwnerRelationSetter<UserAware>,
          },
        }),
        EventEmitter2,
      ],
    };

    return {
      imports: [TypeOrmModule.forFeature(newOptions, dataSource)],
      module: AppTypeOrmModule,
      exports: [TypeOrmModule],
    };
  }
}
