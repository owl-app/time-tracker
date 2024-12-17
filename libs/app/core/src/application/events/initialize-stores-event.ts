import { RouteLocationNormalized } from 'vue-router';

import { LIFECYCLE_EVENTS } from '../contants';
import { defineRequestEvent } from '../defines/events';
import { useAppStore } from '../../stores/app';
import { useUserStore } from '../../stores/user';
import { usePermissionsStore } from '../../stores/permissions';
import { useTimeStore } from '../../stores/time';

type GenericStore = {
  $id: string;
  hydrate?: () => Promise<void>;
  dehydrate?: () => Promise<void>;

  [key: string]: any;
};

export function useStores(
  stores = [useUserStore, usePermissionsStore, useTimeStore]
): GenericStore[] {
  return stores.map((useStore) => useStore()) as GenericStore[];
}

export default defineRequestEvent({
  name: 'initialize-stores',
  priority: 500,
  event: LIFECYCLE_EVENTS.REQUEST.ON_BEFORE_EACH,
  callback: async (to: RouteLocationNormalized): Promise<void> => {
    const stores = useStores();
    const appStore = useAppStore();
    const userStore = useUserStore();

    if (
      to.meta?.public === true ||
      appStore.initialized ||
      appStore.initializing ||
      !userStore.authenticated
    )
      return;

    appStore.initializing = true;

    try {
      const hydratedStores = ['userStore'];
      await Promise.all(
        stores.filter(({ $id }) => !hydratedStores.includes($id)).map((store) => store.hydrate?.())
      );
    } catch (error: any) {
      appStore.error = error;
    }
  },
});
