import { Repository } from 'typeorm';

import { Registry } from '@owl-app/registry';
import { DeepPartial } from '@owl-app/nestjs-query-core';

import { Permission } from '@owl-app/lib-api-core/rbac/types/permission';
import { RbacManager, Role } from '@owl-app/rbac-manager';
import {
  AppTypeOrmQueryService,
  AppTypeOrmQueryServiceOpts,
} from '@owl-app/lib-api-core/query/typeorm/services/app-typeorm-query.service';
import { FilterQuery } from '@owl-app/lib-api-core/registry/interfaces/filter-query';
import { EntitySetter } from '@owl-app/lib-api-core/registry/interfaces/entity-setter';

import { PermissionEntity } from '../../../../domain/entity/permission.entity';
import mapper from '../../../mapping';

export class PermissionService extends AppTypeOrmQueryService<PermissionEntity> {
  constructor(
    readonly repository: Repository<PermissionEntity>,
    opts: AppTypeOrmQueryServiceOpts<PermissionEntity>,
    readonly filters: Registry<FilterQuery<PermissionEntity>>,
    readonly setters: Registry<EntitySetter<PermissionEntity>>,
    private rbacManager: RbacManager<Permission, Role>
  ) {
    super(repository, opts);
  }

  public override async createOne(
    record: DeepPartial<PermissionEntity>
  ): Promise<PermissionEntity> {
    this.resolveName(record);

    const permission = mapper.toPersistence(record);

    await this.rbacManager.addPermission(permission, [
      { name: 'collection', value: record.collection },
      { name: 'refer', value: record.refer },
    ]);

    return Object.assign(
      mapper.toResponse({
        ...record,
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt,
      })
    );
  }

  async updateOne(
    id: number | string,
    update: DeepPartial<PermissionEntity>
  ): Promise<PermissionEntity> {
    const existPermission = await this.findById(id as string);

    const permission = mapper.toPersistence({
      ...existPermission,
      ...update,
    });

    await this.rbacManager.updatePermission(id as string, permission);

    return mapper.toResponse(permission);
  }

  public async deleteOne(id: string | number): Promise<PermissionEntity> {
    const permission = await this.findById(id as string);

    await this.rbacManager.removePermission(permission.name);

    return permission;
  }

  private resolveName(record: DeepPartial<PermissionEntity>): void {
    record.name = `${record.refer}_${record.collection}_${record.name}`.toUpperCase();
  }
}
