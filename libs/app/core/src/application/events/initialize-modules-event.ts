import { ShallowRef } from 'vue';

import { LIFECYCLE_EVENTS } from '../contants';
import RouterPass from '../../router/passthrough';
import { defineRequestEvent } from '../defines/events';
import { useAppStore } from '../../stores/app';
import { useUserStore } from '../../stores/user';
import { usePermissionsStore } from '../../stores/permissions';
import { RequestEvent } from '../types/lifecycle';
import { ModuleConfig } from '../types/module';
import { router } from '../router';

export function defineModuleRequestEvent(
  registeredModules: ShallowRef<ModuleConfig[]>,
  modules: ModuleConfig[]
): RequestEvent[] {
  return [
    defineRequestEvent({
      name: 'initialize-modules',
      priority: 450,
      event: LIFECYCLE_EVENTS.REQUEST.ON_BEFORE_EACH,
      callback: async (): Promise<void> => {
        const appStore = useAppStore();
        const userStore = useUserStore();
        const permissionsStore = usePermissionsStore();

        if (!appStore.initializing) return;

        registeredModules.value = (
          await Promise.all(
            modules.map(async (module) => {
              if (!module.preRegisterCheck) return module;

              const allowed = await module.preRegisterCheck(
                userStore.currentUser,
                permissionsStore.permissions?.routes ?? []
              );

              if (allowed) return module;

              return null;
            })
          )
        ).filter((module): module is ModuleConfig => module !== null);

        for (const module of registeredModules.value) {
          if (module.routes?.private ?? false) {
            router.addRoute({
              name: module.id,
              path: `/`,
              component: RouterPass,
              children: module.routes?.private,
            });
          }
        }
      },
    }),
    defineRequestEvent({
      name: 'deinitialize-modules',
      priority: 998,
      event: LIFECYCLE_EVENTS.REQUEST.ON_AFTER_EACH,
      callback: async (): Promise<void> => {
        const appStore = useAppStore();
        const userStore = useUserStore();

        if (!appStore.initialized || userStore.authenticated) return;

        registeredModules.value = [];

        for (const module of modules) {
          if (module.routes?.private ?? false) {
            router.removeRoute(module.id);
          } else {
            registeredModules.value.push(module);
          }
        }

        appStore.initialized = false;
      },
    }),
  ];
}
