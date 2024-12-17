import { LIFECYCLE_EVENTS } from '../contants';
import { defineRequestEvent } from '../defines/events';
import { useAppStore } from '../../stores/app';
import { getCurrentLanguage } from '../lang/get-current-language';
import { setLanguage } from '../lang/set-language';

export default defineRequestEvent({
  name: 'initialize-lang',
  priority: 400,
  event: LIFECYCLE_EVENTS.REQUEST.ON_BEFORE_EACH,
  callback: async (): Promise<void> => {
    const appStore = useAppStore();

    if (!appStore.initializing) return;

    try {
      const lang = getCurrentLanguage();

      await setLanguage(lang);
    } catch (error: any) {
      appStore.error = error;
    }
  },
});
