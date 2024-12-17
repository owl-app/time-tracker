<template>
  <va-select
    label="Roles"
    name="role"
    highlight-matched-text
    searchPlaceholderText="Search tags"
    searchable
    v-model="model"
    :text-by="(option: Role) => option?.setting?.displayName"
    :track-by="(option: Role) => option.name"
    :options="roles"
    :validation="validation"
    :error="!!validation['role']"
    :error-messages="validation['role']"
    :required-mark="true"
  >
    <template #content="{ value }">
      <va-badge
        class="mr-0.5 mt-0.5"
        color="primary"
        :text="value?.setting?.displayName"
        :key="value"
      />
    </template>
  </va-select>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { useApi } from '@owl-app/lib-app-core/composables/use-system';

import { type Role } from '@owl-app/lib-contracts';

const api = useApi();

const roles = ref<Role[]>([]);

const model = defineModel({ type: Object, default: () => {} });

defineProps({
  validation: {
    type: Object,
    default() {
      return {};
    },
  },
});

loadRoles();

async function loadRoles(): Promise<void> {
  const result = await api.get('rbac/roles');

  roles.value = result?.data?.items;
}
</script>
