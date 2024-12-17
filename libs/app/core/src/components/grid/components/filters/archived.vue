<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { ArchiveOptions } from '@owl-app/lib-contracts';

const model = defineModel<string>();

defineProps({
  clearable: {
    type: Boolean,
    required: false,
    default: false,
  },
});

defineEmits(['clear']);

const { t } = useI18n();

const options = [
  {
    text: t('grid.filters.archived.show_active'),
    value: ArchiveOptions.ACTIVE,
  },
  {
    text: t('grid.filters.archived.show_archived'),
    value: ArchiveOptions.ARCHIVED,
  },
  { text: t('grid.filters.archived.show_all'), value: ArchiveOptions.ALL },
];
</script>

<template>
  <va-select
    v-model="model"
    text-by="text"
    value-by="value"
    background="#fff"
    :label="`${t('status')}`"
    :placeholder="`${t('select_option')}`"
    :options="options"
    :clearable="clearable"
    @clear="$emit('clear')"
  />
</template>
