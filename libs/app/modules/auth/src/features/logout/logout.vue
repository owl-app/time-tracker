<script setup lang="ts">
import { onMounted } from 'vue';

import { useUserStore } from '@owl-app/lib-app-core/stores/user';

const userStore = useUserStore();

onMounted(() => {
  userStore.logout();
});
</script>

<template>
  <va-inner-loading loading>
    <div class="logout"></div>
  </va-inner-loading>
</template>

<style lang="scss" scoped>
.logout {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
}
</style>
