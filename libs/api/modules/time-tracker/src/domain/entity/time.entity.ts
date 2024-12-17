import type { Time, User, Tenant, Tag, Project } from '@owl-app/lib-contracts';

import BaseEntity from '@owl-app/lib-api-core/database/entity/base.entity';

export class TimeEntity extends BaseEntity implements Time {
  tenant: Tenant;

  user: User;

  project: Project;

  tags: Tag[];

  description: string;

  timeIntervalStart: Date | string;

  timeIntervalEnd: Date | string;
}
