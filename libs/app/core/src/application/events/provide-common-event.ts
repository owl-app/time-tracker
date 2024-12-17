import { App } from 'vue';

import { API_INJECT, LIFECYCLE_EVENTS, STORES_INJECT } from '../contants';
import { defineRequestEvent } from '../defines/events';
import { useUserStore } from '../../stores/user';
import { useTimeStore } from '../../stores/time';
import { usePermissionsStore } from '../../stores/permissions';
import { useAppStore } from '../../stores/app';
import { useRequestsStore } from '../../stores/requests';
import api from '../../services/api';
import { RequestEvent } from '../types/lifecycle';

export default function provideCommonEvent(app: App): RequestEvent {
  return defineRequestEvent({
    name: 'provide-common',
    priority: 350,
    event: LIFECYCLE_EVENTS.REQUEST.ON_BEFORE_EACH,
    callback: async (): Promise<void> => {
      const appStore = useAppStore();

      if (!appStore.initializing) return;

      app.provide(STORES_INJECT, {
        useAppStore,
        useRequestsStore,
        useUserStore,
        useTimeStore,
        usePermissionsStore,
      });

      app.provide(API_INJECT, api);
    },
  });
}
