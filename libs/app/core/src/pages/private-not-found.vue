<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <private-view :title="t('page_not_found')">
    <div class="not-found">
      <v-info :title="t('page_not_found')" icon="not_interested">
        {{ t('page_not_found_body') }}
      </v-info>
    </div>
  </private-view>
</template>

<style lang="scss" scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20vh 0;
}
</style>
