import { Timestampable } from '@owl-app/lib-contracts';

import DomainEventableEntity from './domain-eventable.entity';

export default class BaseEntity extends DomainEventableEntity implements Timestampable {
  id: string;

  createdAt: string;

  updatedAt: string;
}
