import { LIFECYCLE_EVENTS } from '../contants';
import { defineRequestEvent } from '../defines/events';
import { useUserStore } from '../../stores/user';

let firstLoad = true;

export default defineRequestEvent({
  name: 'auth-user-event',
  priority: 600,
  event: LIFECYCLE_EVENTS.REQUEST.ON_BEFORE_EACH,
  callback: async (): Promise<void> => {
    const userStore = useUserStore();

    // refresh token if page reload
    if (firstLoad && Date.now() < userStore.refreshTokenExpiry && !userStore.authenticated) {
      try {
        await userStore.refresh();
      } catch {
        // Ignore error
      } finally {
        firstLoad = false;
      }
    }
  },
});
