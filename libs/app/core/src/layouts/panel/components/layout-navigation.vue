<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useColors } from 'vuestic-ui';

import VaIconMenuCollapsed from '../../../components/icons/VaIconMenuCollapsed.vue';
import { useAppStore } from '../../../stores/app';
import getRoutes from './sidebar/routes';

const { isSidebarMinimized } = storeToRefs(useAppStore());

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const navigationRoutes = getRoutes();

type BreadcrumbNavigationItem = {
  label: string;
  to: string;
  hasChildren: boolean;
};

const findRouteName = (name: string) => {
  const traverse = (routes: any[]): string => {
    for (const routeItem of routes) {
      if (routeItem.name === name) {
        return routeItem.displayName;
      }

      if (routeItem.children) {
        const result = traverse(routeItem.children);
        if (result) {
          return result;
        }
      }
    }

    return '';
  };

  return traverse(navigationRoutes.routes);
};

const items = computed(() => {
  const result: { label: string; to: string; hasChildren: boolean }[] = [];
  route.matched.forEach((routeItem) => {
    const labelKey = findRouteName(routeItem.name as string);
    if (!labelKey) {
      return;
    }
    result.push({
      label: t(labelKey),
      to: route.path,
      hasChildren: routeItem.children && routeItem.children.length > 0,
    });
  });

  return result;
});

const { getColor } = useColors();

const collapseIconColor = computed(() => getColor('secondary'));

const handleBreadcrumbClick = (item: BreadcrumbNavigationItem) => {
  if (!item.hasChildren) {
    router.push(item.to);
  }
};
</script>

<template>
  <div class="flex gap-2">
    <VaIconMenuCollapsed
      class="cursor-pointer"
      :class="{ 'x-flip': !isSidebarMinimized }"
      :color="collapseIconColor"
      @click="isSidebarMinimized = !isSidebarMinimized"
    />

    <nav class="flex items-center">
      <VaBreadcrumbs>
        <VaBreadcrumbsItem label="Home" :to="{ name: 'time-list' }" />
        <VaBreadcrumbsItem
          v-for="item in items"
          :key="item.label"
          :label="item.label"
          @click="handleBreadcrumbClick(item)"
        />
      </VaBreadcrumbs>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.x-flip {
  transform: scaleX(-100%);
}
</style>
