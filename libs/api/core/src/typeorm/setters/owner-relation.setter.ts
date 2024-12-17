import { DeepPartial, EntityMetadata } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserAware } from '@owl-app/lib-contracts';

import { RequestContextService } from '../../context/app-request-context';

import { USER_ENTITY } from '../../entity-tokens';
import { EntitySetter } from '../../registry/interfaces/entity-setter';

@Injectable()
export class OwnerRelationSetter<Entity extends UserAware> implements EntitySetter<Entity> {
  constructor(readonly configService: ConfigService) {}

  supports(metadata: EntityMetadata): boolean {
    return !!metadata.relations.find((r) => r.type === USER_ENTITY && r.propertyName === 'user');
  }

  execute<T extends DeepPartial<Entity>>(entityOrEntities: T | T[]): void {
    if (Array.isArray(entityOrEntities)) {
      entityOrEntities.forEach((entity) => {
        entity.user = { id: RequestContextService.getCurrentUserId() };
      });
    } else {
      entityOrEntities.user = { id: RequestContextService.getCurrentUserId() };
    }
  }
}
