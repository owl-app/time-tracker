<script setup>
import { onBeforeUnmount, onMounted, ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { onBeforeRouteUpdate } from 'vue-router';
import { useBreakpoint } from 'vuestic-ui';

import AppLayoutNavigation from './components/layout-navigation.vue';
import AppNavbar from './components/navbar/navbar.vue';
import AppSidebar from './components/sidebar/sidebar.vue';

import { useAppStore } from '../../stores/app';

const appStore = useAppStore();

const breakpoints = useBreakpoint();

const sidebarWidth = ref('16rem');
const sidebarMinimizedWidth = ref(undefined);

const isMobile = ref(false);
const isTablet = ref(false);
const { isSidebarMinimized } = storeToRefs(appStore);

const onResize = () => {
  isSidebarMinimized.value = breakpoints.mdDown;
  isMobile.value = breakpoints.smDown;
  isTablet.value = breakpoints.mdDown;
  sidebarMinimizedWidth.value = isMobile.value ? '0' : '4.5rem';
  sidebarWidth.value = isTablet.value ? '100%' : '16rem';
};

onMounted(() => {
  window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
});

onBeforeRouteUpdate(() => {
  if (breakpoints.mdDown) {
    // Collapse sidebar after route change for Mobile
    isSidebarMinimized.value = true;
  }
});

const isFullScreenSidebar = computed(() => isTablet.value && !isSidebarMinimized.value);

const onCloseSidebarButtonClick = () => {
  isSidebarMinimized.value = true;
};
</script>

<template>
  <VaLayout
    :top="{ fixed: true, order: 2 }"
    :left="{
      fixed: true,
      absolute: breakpoints.mdDown,
      order: 1,
      overlay: breakpoints.mdDown && !isSidebarMinimized,
    }"
    @leftOverlayClick="isSidebarMinimized = true"
  >
    <template #top>
      <AppNavbar :is-mobile="isMobile" />
    </template>

    <template #left>
      <AppSidebar :minimized="isSidebarMinimized" :animated="!isMobile" :mobile="isMobile" />
    </template>

    <template #content>
      <div :class="{ minimized: isSidebarMinimized }" class="app-layout__sidebar-wrapper">
        <div v-if="isFullScreenSidebar" class="flex justify-end">
          <VaButton
            class="px-4 py-4"
            icon="md_close"
            preset="plain"
            @click="onCloseSidebarButtonClick"
          />
        </div>
      </div>
      <AppLayoutNavigation v-if="!isMobile" class="p-4" />
      <main class="p-4 pt-0">
        <article>
          <slot />
        </article>
      </main>
    </template>
  </VaLayout>
</template>

<style lang="scss" scoped>
// Prevent icon jump on animation
.va-sidebar {
  width: unset !important;
  min-width: unset !important;
}
</style>
