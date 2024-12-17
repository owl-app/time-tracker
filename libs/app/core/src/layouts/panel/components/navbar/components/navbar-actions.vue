<script lang="ts" setup>
import { useTimeStore } from '../../../../../stores/time';

import ProfileDropdown from './dropdowns/profile-dropdown.vue';
// import NotificationDropdown from './dropdowns/notification-dropdown.vue'

defineProps({
  isMobile: { type: Boolean, default: false },
});

const timeStore = useTimeStore();
</script>

<template>
  <div class="app-navbar-actions">
    <div v-if="timeStore.active">
      <VaInnerLoading size="1.4rem" :loading="timeStore.loading" color="#fff">
        <VaButton :visible="false" icon="schedule" color="danger" class="mr-4 w-36">
          <span :class="{ invisible: timeStore.loading }">
            {{ timeStore.timer }}
          </span>
        </VaButton>
      </VaInnerLoading>
    </div>
    <!-- <NotificationDropdown class="app-navbar-actions__item" /> -->
    <ProfileDropdown class="app-navbar-actions__item app-navbar-actions__item--profile mr-1" />
  </div>
</template>

<style lang="scss">
.app-navbar-actions {
  display: flex;
  align-items: center;

  .va-dropdown__anchor {
    color: var(--va-primary);
    fill: var(--va-primary);
  }

  &__item {
    padding: 0;
    margin-left: 0.25rem;
    margin-right: 0.25rem;

    svg {
      height: 20px;
    }

    &--profile {
      display: flex;
      justify-content: center;
    }

    .va-dropdown-content {
      background-color: var(--va-white);
    }

    @media screen and (max-width: 640px) {
      margin-left: 0;
      margin-right: 0;

      &:first-of-type {
        margin-left: 0;
      }
    }
  }

  .fa-github {
    color: var(--va-on-background-primary);
  }
}
</style>
