import { useLocalStorage } from '@vueuse/core';
import type {} from '@vueuse/shared';
import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * Global application state
 */
export const useAppStore = defineStore('appStore', () => {
  /** Toggled visibility state of the left navigation bar. Synced with localStorage */
  const navbarOpen = useLocalStorage('app-store-navbar-open', window.innerWidth >= 1430);

  /** Toggled visibility state of the right contextual sidebar. Synced with localStorage */
  const isSidebarMinimized = useLocalStorage('app-store-sidebar-minimized', false);

  /** Toggled visibility state notifications drawer */
  const notificationsDrawerOpen = ref(false);

  /** Full screen hides the sidebars completely */
  const fullScreen = ref(false);

  /** Have all stores been initialized. This indicates that the app is ready to be rendered */
  const initialized = ref(false);

  /** Stores are currently being initialized */
  const initializing = ref(false);

  /** Global hydration error. App should not be rendered */
  const error = ref(null);

  /** What basemap provider should be used in global map interfaces */
  const basemap = ref('OpenStreetMap');

  return {
    navbarOpen,
    isSidebarMinimized,
    notificationsDrawerOpen,
    fullScreen,
    initialized,
    initializing,
    error,
    basemap,
  };
});
