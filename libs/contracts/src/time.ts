import { Project } from './project';
import { Tag } from './tag';
import { TenantAware } from './tenant';
import { Timestampable } from './timestampable';
import { User } from './user';

export type Time = TenantAware &
  Timestampable & {
    id: string;
    user: User;
    project: Project;
    tags: Tag[];
    timeIntervalStart: Date | string;
    timeIntervalEnd: Date | string;
    description: string;
  };
