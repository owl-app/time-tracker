import { EventEmitter2 } from '@nestjs/event-emitter';
import { Exclude } from 'class-transformer';

import { DomainEvent } from '../../event/domain-event.base';

export default class DomainEventableEntity {
  @Exclude()
  private availableDomainEvents: DomainEvent[] = [];

  get domainEvents(): DomainEvent[] {
    return this.availableDomainEvents;
  }

  public addEvent(domainEvent: DomainEvent): void {
    this.availableDomainEvents.push(domainEvent);
  }

  public clearEvents(): void {
    this.availableDomainEvents = [];
  }

  public async publishEvents(id: string, eventEmitter: EventEmitter2): Promise<void> {
    await Promise.all(
      this.domainEvents.map(async (event) => {
        const result = await eventEmitter.emitAsync(
          event.eventName ?? event.constructor.name,
          Object.assign(event, { id })
        );

        return result;
      })
    );
    this.clearEvents();
  }
}
