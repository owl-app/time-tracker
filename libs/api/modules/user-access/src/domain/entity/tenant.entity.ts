import { Tenant, User } from '@owl-app/lib-contracts';
import BaseEntity from '@owl-app/lib-api-core/database/entity/base.entity';

export class TenantEntity extends BaseEntity implements Tenant {
  id: string;

  name: string;

  users: Partial<User>[];

  constructor(partial?: Partial<TenantEntity>) {
    super();
    Object.assign(this, partial);
  }
}
