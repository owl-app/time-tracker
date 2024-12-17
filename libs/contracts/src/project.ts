import { Archivable } from './archive';
import { Client } from './client';
import { TenantAware } from './tenant';
import { Time } from './time';
import { Timestampable } from './timestampable';

export type Project = TenantAware &
  Timestampable &
  Archivable & {
    id: string;
    client: Client;
    times: Time[];
    name: string;
  };
