import { Type } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Mapper } from '@owl-app/lib-api-core/types/mapper.interface';

import { PermissionEntity } from '../domain/entity/permission.entity';

export class RbacPermissionMapper<
  Entity extends DeepPartial<PermissionEntity>,
  BaseItem extends DeepPartial<PermissionEntity>,
  Response extends DeepPartial<PermissionEntity>
> implements Mapper<Entity, BaseItem, Response>
{
  constructor(private response: Type<Response>, private item: Type<BaseItem>) {}

  toPersistence(request: Entity): BaseItem {
    // eslint-disable-next-line new-cap
    return new this.item(
      request.name,
      request.description,
      request.ruleName,
      request.createdAt || new Date(),
      request.updatedAt || new Date(),
      request.collection || null,
      request.refer || null
    );
  }

  toResponse(item: DeepPartial<PermissionEntity>): Response {
    // eslint-disable-next-line new-cap
    const role = new this.response();
    role.name = item.name;
    role.description = item.description;
    role.ruleName = item.ruleName;
    role.refer = item.refer;
    role.collection = item.collection;
    role.createdAt = item.createdAt;
    role.updatedAt = item.updatedAt;

    return role;
  }
}
