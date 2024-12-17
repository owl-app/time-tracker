import { shallowRef, type ShallowRef } from 'vue';
import { sortBy } from 'lodash';

import { router } from '../router';
import RouterPass from '../../router/passthrough';
import type { ModuleConfig } from '../types/module';

export function getInternalModules(): ModuleConfig[] {
  const modules = import.meta.glob<ModuleConfig>('./*/index.ts', {
    import: 'default',
    eager: true,
  });

  return sortBy(Object.values(modules), 'id');
}

export function registerModules(modules: ModuleConfig[]): ShallowRef<ModuleConfig[]> {
  const registeredModules = shallowRef<ModuleConfig[]>([]);

  for (const module of modules) {
    if (module.routes?.public ?? false) {
      router.addRoute({
        name: module.id,
        path: `/`,
        component: RouterPass,
        children: module.routes?.public,
      });

      registeredModules.value.push(module);
    }
  }

  return registeredModules;
}
