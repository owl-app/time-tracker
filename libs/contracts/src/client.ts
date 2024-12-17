import { Archivable } from './archive';
import { Project } from './project';
import { TenantAware } from './tenant';
import { Timestampable } from './timestampable';

export type Client = TenantAware &
  Timestampable &
  Archivable & {
    id: string;
    projects: Project[];
    name: string;
    email: string;
    address: string;
    description: string;
  };
