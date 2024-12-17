import { Timestampable } from './timestampable';
import { User } from './user';

export type Tenant = Timestampable & {
  id: string;
  name: string;
  users: Partial<User>[];
};

export type TenantAware = {
  tenant: Tenant;
};
