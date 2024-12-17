import type { RouteRecordRaw } from 'vue-router';

import { User } from '@owl-app/lib-contracts';

export interface ModuleConfig {
  id: string;
  name: string;
  icon: string;
  routes?: {
    public?: RouteRecordRaw[];
    private?: RouteRecordRaw[];
  };
  hidden?: boolean;
  preRegisterCheck?: (user: User | null, permissions: string[]) => Promise<boolean> | boolean;
}
