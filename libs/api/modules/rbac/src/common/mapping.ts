import { Type } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Mapper } from '@owl-app/lib-api-core/types/mapper.interface';

import { BaseAuthItemEntity } from '../domain/entity/base-auth.entity';

export class RbacItemMapper<
  Entity extends DeepPartial<BaseAuthItemEntity>,
  BaseItem extends DeepPartial<BaseAuthItemEntity>,
  Response extends DeepPartial<BaseAuthItemEntity>
> implements Mapper<Entity, BaseItem, Response>
{
  constructor(private response: Type<Response>, private item: Type<BaseItem>) {}

  toPersistence(request: Entity): BaseItem {
    // eslint-disable-next-line new-cap
    return new this.item(request.name, request.description, request.ruleName);
  }

  toResponse(item: DeepPartial<BaseAuthItemEntity>): Response {
    // eslint-disable-next-line new-cap
    const role = new this.response();
    role.name = item.name;
    role.description = item.description;
    role.ruleName = item.ruleName;
    role.createdAt = item.createdAt;
    role.updatedAt = item.updatedAt;

    return role;
  }
}
