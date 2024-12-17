import { LIFECYCLE_EVENTS } from '../contants';
import { defineRequestEvent } from '../defines/events';
import { useUserStore } from '../../stores/user';

export default defineRequestEvent({
  name: 'hydrate-user-event',
  priority: 550,
  event: LIFECYCLE_EVENTS.REQUEST.ON_BEFORE_EACH,
  callback: async (): Promise<void | string> => {
    const userStore = useUserStore();

    if (!userStore.currentUser && userStore.authenticated)
      try {
        await userStore.hydrate();

        if (userStore.error) {
          userStore.authenticated = false;
          userStore.refreshTokenExpiry = 0;
        }
      } catch {
        // Ignore error
      }
  },
});
