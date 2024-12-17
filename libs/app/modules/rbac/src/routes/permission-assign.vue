<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { debounce } from 'lodash';

import { Permission } from '@owl-app/lib-contracts';

import HeaderBar from '@owl-app/lib-app-core/layouts/panel/components/header-bar.vue';
import { useApi } from '@owl-app/lib-app-core/composables/use-system';

export type GroupedPermission = {
  name: string;
  value: boolean;
  description?: string;
  loading: boolean;
};

const { t } = useI18n();
const route = useRoute();
const api = useApi();

const permissions = ref<any>([]);

loadPermissions();

async function loadPermissions(): Promise<void> {
  const result = await api.get('rbac/permissions?pageable=0');
  const assignedPermissions = (
    await api.get(`rbac/roles/assigned-permissions/${route.params?.roleId}`)
  ).data;

  permissions.value = result?.data?.items.reduce(
    (groupedPermissions: Record<string, GroupedPermission[]>, permission: Permission) => {
      if (permission.collection) {
        if (!groupedPermissions[permission.collection]) {
          groupedPermissions[permission.collection] = [];
        }

        groupedPermissions[permission.collection].push({
          name: permission.name,
          value: assignedPermissions.includes(permission.name),
          description: permission.description,
          loading: false,
        });

        return groupedPermissions;
      }

      return null;
    },
    {}
  );
}

async function change(value: string, permission: GroupedPermission) {
  permission.loading = true;

  debounce(async () => {
    if (value) {
      await api.put(`rbac/roles/assign/${route.params?.roleId}`, [permission.name]);
    } else {
      await api.put(`rbac/roles/revoke/${route.params?.roleId}`, [permission.name]);
    }

    permission.loading = false;
  }, 500)();
}
</script>

<template>
  <panel-layout>
    <header-bar
      :title="t('assign_permissions')"
      :description="t('assign_permissions_to_role')"
      icon="join"
    />
    <div class="grid grid-cols-3 gap-4">
      <va-card tag="b" v-for="(group, key) in permissions" :key="key">
        <va-card-title>
          <va-chip color="#d9efff" size="small">{{ key }}</va-chip>
        </va-card-title>

        <va-card-content>
          <div v-for="(permission, key) in group" :key="key">
            <va-switch
              v-model="permission.value"
              :label="permission.description"
              :loading="permission.loading"
              size="small"
              @update:modelValue="($event) => change($event, permission)"
            />
          </div>
        </va-card-content>
      </va-card>
    </div>
  </panel-layout>
</template>

<style lang="scss" scoped>
:deep() {
  .va-chip {
    margin-bottom: 1rem;
    color: #d9efff;
  }
}
</style>
