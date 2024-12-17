import type { Tag, Tenant } from '@owl-app/lib-contracts';

import BaseEntity from '@owl-app/lib-api-core/database/entity/base.entity';

export class TagEntity extends BaseEntity implements Tag {
  id: string;

  tenant: Tenant;

  name: string;

  color: string;

  archived: boolean;
}
