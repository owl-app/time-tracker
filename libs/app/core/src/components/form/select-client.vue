<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Client } from '@owl-app/lib-contracts';

import { useApi } from '../../composables/use-system';

const model = defineModel<Client>();

const api = useApi();
const { t } = useI18n();

const clients = ref<Client[]>([]);
const loading = ref(false);

defineProps({
  clearable: {
    type: Boolean,
    required: false,
    default: false,
  },
});

defineEmits(['clear']);

loadClients();

async function loadClients(): Promise<void> {
  loading.value = true;
  const result = await api.get('clients?pageable=0');

  clients.value =
    result?.data?.items?.map(({ id, name }: { id: string; name: string }) => ({ id, name })) ?? [];
  loading.value = false;
}
</script>

<template>
  <va-select
    v-model="model"
    searchable
    :label="`${t('collection')}`"
    :placeholder="`${t('select_option')}`"
    :options="clients"
    :clearable="clearable"
    :text-by="(option: Client) => option.name"
    :track-by="(option: Client) => option.id"
    @clear="$emit('clear')"
    :loading="loading"
  />
</template>
