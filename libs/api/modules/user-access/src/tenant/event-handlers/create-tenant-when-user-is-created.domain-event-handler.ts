import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { User } from '@owl-app/lib-contracts';

import { DomainEvent } from '@owl-app/lib-api-core/event/domain-event.base';
import { InjectRepository } from '@owl-app/lib-api-core/typeorm/common/typeorm.decorators';
import { InjectableRepository } from '@owl-app/lib-api-core/database/repository/injectable.repository';

import { TenantEntity } from '../../domain/entity/tenant.entity';

@Injectable()
export class CreateTenantWhenUserIsCreatedDomainEventHandler {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: InjectableRepository<TenantEntity>
  ) {}

  // Handle a Domain Event by performing changes to other aggregates (inside the same Domain).
  @OnEvent('USER_ENTITY_CREATED', { async: true, promisify: true, suppressErrors: false })
  async handle(event: DomainEvent & User): Promise<void> {
    const tenant = new TenantEntity({ name: event.email, users: [{ id: event.id }] });

    await this.tenantRepository.save(tenant);
  }
}
