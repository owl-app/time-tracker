<script setup lang="ts">
import { PermissionReferType } from '@owl-app/lib-contracts';
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

const options = [PermissionReferType.ROUTE, PermissionReferType.FIELD];
</script>

<template>
  <VaSelect
    v-model="model"
    :label="`${t('refer')}`"
    :placeholder="`${t('select_option')}`"
    :options="options"
    :clearable="clearable"
    @clear="$emit('clear')"
  />
</template>
