<script setup lang="ts">
import { ref } from 'vue';
import { defineVaDataTableColumns } from 'vuestic-ui/web-components';
import { useI18n } from 'vue-i18n';

import { AvalilableCollections, Client, CommonActions, CrudActions } from '@owl-app/lib-contracts';

import Grid from '@owl-app/lib-app-core/components/grid/grid.vue';
import StringFilter from '@owl-app/lib-app-core/components/grid/components/filters/string.vue';
import ArchivedFilter from '@owl-app/lib-app-core/components/grid/components/filters/archived.vue';
import DeleteModal from '@owl-app/lib-app-core/components/modal/delete-modal.vue';
import { usePermissions } from '@owl-app/lib-app-core/composables/use-permissions';

import ArchiveModal from '../components/archive-modal.vue';
import CreateInline from '../components/create-inline.vue';
import ClientModal from '../components/client-modal.vue';

const { t } = useI18n();

const showModalUser = ref(false);
const editClient = ref<Client | null>();
const gridRef = ref<InstanceType<typeof Grid>>();
const clientModal = ref<InstanceType<typeof ClientModal>>();
const deleteModal = ref<InstanceType<typeof DeleteModal>>();
const archiveModal = ref<InstanceType<typeof ArchiveModal>>();
const restoreModal = ref<InstanceType<typeof ArchiveModal>>();

const { hasRoutePermission } = usePermissions(AvalilableCollections.CLIENT);

const headerBar = {
  title: t('clients'),
  description: 'Managing clients in system',
  icon: 'person',
};

const columns = defineVaDataTableColumns([
  { label: 'Name', key: 'name', sortable: true, tdClass: ['is-line-through'] },
  { label: ' ', key: 'actions' },
]);

const getRowBind = (row: Client): Record<string, string> => {
  if (row.archived) {
    return {
      class: 'archived',
    };
  }
  return {};
};
</script>

<template>
  <panel-layout>
    <grid
      ref="gridRef"
      url="clients"
      default-sort="id"
      :default-filters="{ archived: 'all' }"
      :columns="columns"
      :headerBar="headerBar"
      :row-bind="getRowBind"
    >
      <template #content-filter="{ filters, changeFilter, removeFilter }">
        <div
          class="grid grid-cols-12 gap-2 grid-flow-col"
          style="margin-left: auto; grid-auto-flow: column"
        >
          <div class="col-start-1 col-end-3">
            <archived-filter
              :modelValue="filters.archived"
              @update:model-value="(value: string) => changeFilter({ archived: value })"
              @clear="() => removeFilter('archived')"
            />
          </div>
          <div class="col-start-3 col-end-6">
            <div>
              <div class="grid grid-cols-1 gap-4">
                <string-filter
                  single-filter="contains"
                  labelSearchInput="Search by name"
                  :data="filters?.search"
                  :change-filter="changeFilter"
                  :remove-filter="removeFilter"
                />
              </div>
            </div>
          </div>
          <div class="col-end-13 col-span-3 content-end">
            <create-inline
              @saved="gridRef?.addItem"
              v-if="hasRoutePermission(CrudActions.CREATE)"
            />
          </div>
        </div>
        <div class="my-4">
          <va-divider />
        </div>
      </template>

      <template #cell(actions)="{ rowData: client }">
        <div class="flex gap-2 justify-end">
          <va-button
            preset="primary"
            size="small"
            color="primary"
            icon="mso-edit"
            aria-label="Edit client"
            @click="clientModal?.show(client)"
            v-if="hasRoutePermission(CrudActions.UPDATE)"
          />
          <va-menu :autoPlacement="false">
            <template #anchor>
              <va-icon class="mt-0.5" name="more_vert" />
            </template>

            <va-menu-item
              @selected="archiveModal?.show(true, client?.id)"
              v-if="hasRoutePermission(CommonActions.ARCHIVE) && !client?.archived"
            >
              <va-icon name="archive" class="material-symbols-outlined mr-1" /> archive
            </va-menu-item>

            <va-menu-item
              @selected="restoreModal?.show(false, client?.id)"
              v-if="hasRoutePermission(CommonActions.ARCHIVE) && client?.archived"
            >
              <va-icon name="restore_page" class="material-symbols-outlined mr-1" /> restore
            </va-menu-item>

            <va-menu-item
              @selected="deleteModal?.show(client?.id)"
              v-if="hasRoutePermission(CrudActions.DELETE) && client?.archived"
            >
              <va-icon name="delete" color="danger" class="material-symbols-outlined mr-1" />
              <span style="color: var(--va-danger)"> delete</span>
            </va-menu-item>
          </va-menu>
        </div>
      </template>
    </grid>
    <client-modal
      ref="clientModal"
      v-model="showModalUser"
      :user="editClient"
      @saved="gridRef?.reloadGrid()"
    />
    <delete-modal ref="deleteModal" collection="clients" @deleted="gridRef?.reloadGrid" />
    <archive-modal ref="archiveModal" collection="clients" @archived="gridRef?.reloadGrid" />
    <archive-modal ref="restoreModal" collection="clients" @archived="gridRef?.reloadGrid" />
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
