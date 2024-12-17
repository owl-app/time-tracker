<script setup lang="ts">
import { AvalilableCollections } from '@owl-app/lib-contracts';
import { useI18n } from 'vue-i18n';

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
  AvalilableCollections.CLIENT,
  AvalilableCollections.USER,
  AvalilableCollections.ROLE,
  AvalilableCollections.PERMISSION,
  AvalilableCollections.TIME,
  AvalilableCollections.TAG,
  AvalilableCollections.PROJECT,
];
</script>

<template>
  <VaSelect
    v-model="model"
    :label="`${t('collection')}`"
    :placeholder="`${t('select_option')}`"
    :options="options"
    :clearable="clearable"
    @clear="$emit('clear')"
  />
</template>
