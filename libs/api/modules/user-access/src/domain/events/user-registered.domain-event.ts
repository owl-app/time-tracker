import { DomainEvent, DomainEventProps } from '@owl-app/lib-api-core/event/domain-event.base';

export class UserRegisteredDomainEvent extends DomainEvent {
  readonly email: string;

  constructor(props: DomainEventProps<UserRegisteredDomainEvent>) {
    super(props);
    this.email = props.email;
  }
}
