import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { InjectRepository } from '@owl-app/lib-api-core/typeorm/common/typeorm.decorators';
import { InjectableRepository } from '@owl-app/lib-api-core/database/repository/injectable.repository';

import { UserRegisteredDomainEvent } from '../../domain/events/user-registered.domain-event';
import { TenantEntity } from '../../domain/entity/tenant.entity';

@Injectable()
export class CreateTenantWhenUserIsRegisteredDomainEventHandler {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: InjectableRepository<TenantEntity>
  ) {}

  // Handle a Domain Event by performing changes to other aggregates (inside the same Domain).
  // supressErrors to true because we need reject transaction
  @OnEvent(UserRegisteredDomainEvent.name, { async: true, promisify: true, suppressErrors: false })
  async handle(event: UserRegisteredDomainEvent): Promise<void> {
    const tenant = new TenantEntity({ name: event.email, users: [{ id: event.id }] });

    await this.tenantRepository.save(tenant);
  }
}
