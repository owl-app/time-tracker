import type { Client, Project, Tenant, Time } from '@owl-app/lib-contracts';

import BaseEntity from '@owl-app/lib-api-core/database/entity/base.entity';

export class ProjectEntity extends BaseEntity implements Project {
  id: string;

  tenant: Tenant;

  client: Client;

  times: Time[];

  name: string;

  archived: boolean;
}
