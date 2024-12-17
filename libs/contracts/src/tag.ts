import { Archivable } from './archive';
import { TenantAware } from './tenant';
import { Timestampable } from './timestampable';

export type Tag = TenantAware &
  Timestampable &
  Archivable & {
    id: string;
    name: string;
    color: string;
  };
