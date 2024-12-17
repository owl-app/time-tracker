<template>
  <VaNavbar class="app-layout-navbar py-3 px-0">
    <template #left>
      <div class="left">
        <Transition v-if="isMobile" name="icon-fade" mode="out-in">
          <VaIcon
            color="primary"
            :name="isSidebarMinimized ? 'menu' : 'close'"
            size="24px"
            style="margin-top: 3px"
            @click="isSidebarMinimized = !isSidebarMinimized"
          />
        </Transition>
        <RouterLink to="/times" aria-label="Owl">
          <div class="logo-bar">
            <OwlLogo />
            <div class="flex items-center">
              <div class="title">OWL</div>
              <div class="subtitle ml-3 mb-auto align-start">time tracker</div>
            </div>
          </div>
        </RouterLink>
      </div>
    </template>
    <template #right>
      <NavbarActions class="app-navbar__actions" :is-mobile="isMobile" />
    </template>
  </VaNavbar>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAppStore } from '../../../../stores/app';
import OwlLogo from '../../../../components/logo-cropped.vue';
import NavbarActions from './components/navbar-actions.vue';

defineProps({
  isMobile: { type: Boolean, default: false },
});

const appStore = useAppStore();

const { isSidebarMinimized } = storeToRefs(appStore);
</script>

<style lang="scss" scoped>
.va-navbar {
  z-index: 2;
  -webkit-box-shadow: 0px 9px 16px -16px rgba(66, 68, 90, 1);
  -moz-box-shadow: 0px 9px 16px -16px rgba(66, 68, 90, 1);
  box-shadow: 0px 9px 16px -16px rgba(66, 68, 90, 1);

  @media screen and (max-width: 950px) {
    .left {
      width: 100%;
    }

    .app-navbar__actions {
      display: flex;
      justify-content: space-between;
    }
  }

  .logo-bar {
    display: flex;
    align-items: center;
    font-size: 1.5rem;
    font-weight: bold;
    color: #000;

    img {
      height: 45px;
      margin-right: 0.5rem;
      border-bottom: 3px solid #6b6a69;
    }

    .title {
      color: #6b6a69;
      font-family: sans-serif;
    }

    .subtitle {
      color: #6b6a69;
      font-family: sans-serif;
      font-size: 13px;
      height: 30px;
    }
  }
}

.left {
  display: flex;
  align-items: center;
  margin-left: 1rem;

  & > * {
    margin-right: 1rem;
  }

  & > *:last-child {
    margin-right: 0;
  }
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: transform 0.5s ease;
}

.icon-fade-enter,
.icon-fade-leave-to {
  transform: scale(0.5);
}
</style>
