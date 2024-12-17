import { DeepPartial, EntityMetadata } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { TenantAware } from '@owl-app/lib-contracts';

import { RequestContextService } from '../../context/app-request-context';

import { TENANT_ENTITY } from '../../entity-tokens';
import { EntitySetter } from '../../registry/interfaces/entity-setter';

@Injectable()
export class TenantRelationSetter<Entity extends TenantAware> implements EntitySetter<Entity> {
  constructor(readonly configService: ConfigService) {}

  supports(metadata: EntityMetadata): boolean {
    return !!metadata.relations.find(
      (r) => r.type === TENANT_ENTITY && r.propertyName === 'tenant'
    );
  }

  execute<T extends DeepPartial<Entity>>(entityOrEntities: T | T[]): void {
    if (Array.isArray(entityOrEntities)) {
      entityOrEntities.forEach((entity) => {
        entity.tenant = RequestContextService.getCurrentUser().tenant;
      });
    } else {
      entityOrEntities.tenant = RequestContextService.getCurrentUser().tenant;
    }
  }
}
