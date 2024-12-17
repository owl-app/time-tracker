<script setup lang="ts">
import { useBreakpoint } from 'vuestic-ui';
import OwlLogo from '../../components/logo-white.vue';

const breakpoint = useBreakpoint();
</script>

<template>
  <VaLayout v-if="breakpoint.lgUp" class="h-screen bg-[var(--va-background-secondary)]">
    <template #left>
      <RouterLink
        class="bg-primary h-full flex items-center justify-center"
        style="width: 35vw"
        to="/"
        aria-label="Visit homepage"
      >
        <OwlLogo start="#FFF" class="w-4/12" :height="28" />
      </RouterLink>
    </template>
    <template #content>
      <main class="h-full flex items-center justify-center mx-auto max-w-[420px]">
        <slot />
      </main>
    </template>
  </VaLayout>

  <VaLayout v-else class="h-screen bg-[var(--va-background-secondary)]">
    <template #content>
      <div class="p-4">
        <main class="h-full flex flex-row items-center justify-start mx-auto max-w-[420px]">
          <div class="flex flex-col items-start">
            <RouterLink class="py-4" to="/" aria-label="Visit homepage">
              <OwlLogo logo="logo.svg" class="mb-2" start="#0E41C9" />
            </RouterLink>
            <slot />
          </div>
        </main>
      </div>
    </template>
  </VaLayout>
</template>
