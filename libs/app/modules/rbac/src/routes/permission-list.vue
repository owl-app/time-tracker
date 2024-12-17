<script setup lang="ts">
import { ref } from 'vue';
import { defineVaDataTableColumns } from 'vuestic-ui/web-components';
import { useI18n } from 'vue-i18n';

import { AvalilableCollections, CrudActions } from '@owl-app/lib-contracts';

import Grid from '@owl-app/lib-app-core/components/grid/grid.vue';
import StringFilter from '@owl-app/lib-app-core/components/grid/components/filters/string.vue';
import DeleteModal from '@owl-app/lib-app-core/components/modal/delete-modal.vue';
import { usePermissions } from '@owl-app/lib-app-core/composables/use-permissions';

import PermissionModal from '../components/permission-modal.vue';
import ReferSelect from '../components/form/refer-select.vue';
import CollectionSelect from '../components/form/collection-select.vue';

const { t } = useI18n();

const showModal = ref(false);
const showDeleteModal = ref(false);
const permissionModal = ref<InstanceType<typeof PermissionModal>>();
const deleteModal = ref<InstanceType<typeof DeleteModal>>();
const gridRef = ref<InstanceType<typeof Grid>>();

const { hasRoutePermission } = usePermissions(AvalilableCollections.ROLE);

const headerBar = {
  title: t('permissions'),
  description: 'Managing permissions in system',
  icon: 'vpn_key',
};

const columns = defineVaDataTableColumns([
  { label: 'Description', key: 'description', sortable: true },
  { label: 'Canonical name', key: 'name', sortable: true },
  { label: 'Refer', key: 'refer', sortable: true },
  { label: 'Collection', key: 'collection', sortable: true },
  { label: ' ', key: 'actions' },
]);
</script>

<template>
  <panel-layout>
    <grid
      ref="gridRef"
      :columns="columns"
      defaultSort="id"
      :headerBar="headerBar"
      url="rbac/permissions"
    >
      <template #header-bar-actions>
        <va-button
          preset="primary"
          size="medium"
          color="primary"
          icon="mso-add"
          aria-label="Add permission"
          @click="permissionModal?.show(null)"
          v-if="hasRoutePermission(CrudActions.CREATE)"
        >
          Add permission
        </va-button>
      </template>

      <template #filters="{ filters, changeFilter, removeFilter }">
        <div class="grid grid-cols-12 gap-2">
          <div class="col-span-4">
            <string-filter
              :data="filters?.search"
              :change-filter="changeFilter"
              :remove-filter="removeFilter"
            />
          </div>
          <div class="col-span-2">
            <refer-select
              :modelValue="filters.refer"
              clearable
              @update:model-value="(value: string) => changeFilter({ refer: value })"
              @clear="() => removeFilter('refer')"
            />
          </div>
          <div class="col-span-2">
            <collection-select
              :modelValue="filters.collection"
              clearable
              @update:model-value="(value: string) => changeFilter({ collection: value })"
              @clear="() => removeFilter('collection')"
            />
          </div>
        </div>
      </template>

      <template #cell(actions)="{ rowData: permission }">
        <div class="flex gap-2 justify-end">
          <va-button
            preset="primary"
            size="small"
            color="primary"
            icon="mso-edit"
            aria-label="Edit project"
            @click="permissionModal?.show(permission)"
            v-if="hasRoutePermission(CrudActions.UPDATE)"
          />
          <va-button
            preset="primary"
            size="small"
            icon="mso-delete"
            color="danger"
            aria-label="Delete project"
            @click="deleteModal?.show(permission?.name)"
            v-if="hasRoutePermission(CrudActions.DELETE)"
          />
        </div>
      </template>
    </grid>
    <permission-modal ref="permissionModal" v-model="showModal" @saved="gridRef?.reloadGrid()" />
    <delete-modal
      ref="deleteModal"
      collection="rbac/permissions"
      v-model="showDeleteModal"
      @deleted="gridRef?.reloadGrid()"
    />
  </panel-layout>
</template>

<style lang="scss" scoped>
:deep() {
  .wrapper-grid {
    .header-actions {
      align-self: center;
      justify-self: end;
    }
  }
}
</style>
