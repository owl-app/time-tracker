import { RouteLocationNormalized } from 'vue-router';

import { LIFECYCLE_EVENTS } from '../contants';
import { defineRequestEvent } from '../defines/events';
import { useUserStore } from '../../stores/user';
import { useAppStore } from '../../stores/app';

export default defineRequestEvent({
  name: 'redirect-event',
  priority: -999,
  event: LIFECYCLE_EVENTS.REQUEST.ON_BEFORE_EACH,
  callback: async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<void | string> => {
    const userStore = useUserStore();
    const appStore = useAppStore();

    if (
      (to.name === 'login' || to.fullPath === '/') &&
      to.name !== from.name &&
      userStore.authenticated
    ) {
      return '/times';
    }
    if (to.meta?.public !== true && !userStore.authenticated && to.matched.length > 0) {
      return `/login?redirect=${encodeURIComponent(to.fullPath)}`;
    }
    if (appStore.initializing) {
      // done initializing
      appStore.initializing = false;
      appStore.initialized = true;

      return to.fullPath;
    }

    return undefined;
  },
});
