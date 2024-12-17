<script setup lang="ts">
import { defineVaDataTableColumns } from 'vuestic-ui/web-components';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';

import { AvalilableCollections, CrudActions, User } from '@owl-app/lib-contracts';

import Grid from '@owl-app/lib-app-core/components/grid/grid.vue';
import StringFilter from '@owl-app/lib-app-core/components/grid/components/filters/string.vue';
import DeleteModal from '@owl-app/lib-app-core/components/modal/delete-modal.vue';
import { usePermissions } from '@owl-app/lib-app-core/composables/use-permissions';

import UserModal from '../components/user-modal.vue';

const { t } = useI18n();

const showModalUser = ref(false);
const showDeleteModal = ref(false);
const editUser = ref<User | null>();
const deleteUser = ref<User>();
const gridRef = ref<InstanceType<typeof Grid>>();
const deleteModal = ref<InstanceType<typeof DeleteModal>>();

const headerBar = {
  title: t('users'),
  description: 'Managing users who have access to the panel',
  icon: 'people_alt',
};

const columns = defineVaDataTableColumns([
  { label: 'Full Name', key: 'fullname', sortable: true },
  { label: 'Email', key: 'email', sortable: true },
  { label: 'Phone number', key: 'phoneNumber', sortable: true },
  { label: 'Role', key: 'role', sortable: true },
  { label: ' ', key: 'actions' },
]);

const { hasRoutePermission } = usePermissions(AvalilableCollections.USER);
</script>

<template>
  <panel-layout>
    <grid ref="gridRef" url="users" :columns="columns" defaultSort="id" :headerBar="headerBar">
      <template #header-bar-actions>
        <VaButton
          preset="primary"
          size="medium"
          color="primary"
          icon="mso-add"
          aria-label="Add user"
          @click="
            editUser = null;
            showModalUser = true;
          "
        >
          Add user
        </VaButton>
      </template>
      <template #filters="{ filters, changeFilter, removeFilter }">
        {{ filters?.search }}
        <div class="grid grid-cols-3 gap-4">
          <string-filter
            :data="filters?.search"
            :change-filter="changeFilter"
            :remove-filter="removeFilter"
          />
        </div>
      </template>

      <template #cell(fullname)="{ rowData }">
        <div class="flex items-center gap-2 max-w-[230px] ellipsis">
          {{ rowData.firstName }} {{ rowData.lastName }}
        </div>
      </template>

      <template #cell(email)="{ rowData }">
        <div class="ellipsis max-w-[230px]">
          {{ rowData.email }}
        </div>
      </template>

      <template #cell(phoneNumber)="{ rowData }">
        <div class="flex items-center gap-2 max-w-[230px] ellipsis">
          {{ rowData.phoneNumber }}
        </div>
      </template>

      <template #cell(role)="{ rowData }">
        <va-badge color="primary" :text="rowData.role?.setting?.displayName"></va-badge>
      </template>

      <template #cell(actions)="{ rowData: user }">
        <div class="flex gap-2 justify-end">
          <VaButton
            preset="primary"
            size="small"
            color="primary"
            icon="mso-edit"
            aria-label="Edit project"
            @click="
              editUser = user as User;
              showModalUser = true;
            "
          />
          <VaButton
            preset="primary"
            size="small"
            icon="mso-delete"
            color="danger"
            aria-label="Delete client"
            @click="deleteModal?.show(user?.id)"
            v-if="hasRoutePermission(CrudActions.DELETE)"
          />
        </div>
      </template>
    </grid>
    <user-modal v-model="showModalUser" :user="editUser" @saved="gridRef?.reloadGrid()" />
    <delete-modal
      ref="deleteModal"
      collection="users"
      v-model="showDeleteModal"
      :primaryKey="deleteUser?.id"
      @deleted="gridRef?.reloadGrid"
    />
  </panel-layout>
</template>
