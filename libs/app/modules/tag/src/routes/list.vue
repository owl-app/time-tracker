<script setup lang="ts">
import { ref } from 'vue';
import { defineVaDataTableColumns } from 'vuestic-ui/web-components';
import { useI18n } from 'vue-i18n';

import { AvalilableCollections, Tag, CrudActions, CommonActions } from '@owl-app/lib-contracts';

import Grid from '@owl-app/lib-app-core/components/grid/grid.vue';
import StringFilter from '@owl-app/lib-app-core/components/grid/components/filters/string.vue';
import ArchivedFilter from '@owl-app/lib-app-core/components/grid/components/filters/archived.vue';
import DeleteModal from '@owl-app/lib-app-core/components/modal/delete-modal.vue';
import ArchiveModal from '@owl-app/lib-app-core/components/modal/archive-modal.vue';
import { usePermissions } from '@owl-app/lib-app-core/composables/use-permissions';

import CreateInline from '../components/create-inline.vue';
import TagModal from '../components/tag-modal.vue';

const { t } = useI18n();

const showModalTag = ref(false);
const showDeleteModal = ref(false);
const editTag = ref<Tag | null>();
const gridRef = ref<InstanceType<typeof Grid>>();
const tagModal = ref<InstanceType<typeof TagModal>>();
const deleteModal = ref<InstanceType<typeof DeleteModal>>();
const archiveModal = ref<InstanceType<typeof ArchiveModal>>();
const restoreModal = ref<InstanceType<typeof ArchiveModal>>();

const { hasRoutePermission } = usePermissions(AvalilableCollections.TAG);

const headerBar = {
  title: t('tags'),
  description: 'Managing tags in system',
  icon: 'sell',
};

const columns = defineVaDataTableColumns([
  { label: 'Name', key: 'name', sortable: true, tdClass: ['is-line-through'] },
  { label: 'Color', key: 'color', sortable: true },
  { label: ' ', key: 'actions' },
]);
const getRowBind = (row: Tag): Record<string, string> => {
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
      url="tags"
      default-sort="id"
      :columns="columns"
      :default-filters="{ archived: 'all' }"
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

      <template #cell(color)="{ rowData }">
        <div class="flex items-center gap-2 max-w-[230px] ellipsis">
          <va-badge :text="`color: ${rowData.color}`" :color="rowData.color" v-if="rowData.color" />
        </div>
      </template>

      <template #cell(actions)="{ rowData: tag }">
        <div class="flex gap-2 justify-end">
          <VaButton
            preset="primary"
            size="small"
            color="primary"
            icon="mso-edit"
            aria-label="Edit tag"
            @click="tagModal?.show(tag)"
            v-if="hasRoutePermission(CrudActions.UPDATE)"
          />
          <va-menu :autoPlacement="false">
            <template #anchor>
              <va-icon class="mt-0.5" name="more_vert" />
            </template>

            <va-menu-item
              @selected="archiveModal?.show(true, tag?.id)"
              v-if="hasRoutePermission(CommonActions.ARCHIVE) && !tag?.archived"
            >
              <va-icon name="archive" class="material-symbols-outlined mr-1" /> archive
            </va-menu-item>

            <va-menu-item
              @selected="restoreModal?.show(false, tag?.id)"
              v-if="hasRoutePermission(CommonActions.ARCHIVE) && tag?.archived"
            >
              <va-icon name="restore_page" class="material-symbols-outlined mr-1" /> restore
            </va-menu-item>

            <va-menu-item
              @selected="deleteModal?.show(tag?.id)"
              v-if="hasRoutePermission(CrudActions.DELETE) && tag?.archived"
            >
              <va-icon name="delete" color="danger" class="material-symbols-outlined mr-1" />
              <span style="color: var(--va-danger)"> delete</span>
            </va-menu-item>
          </va-menu>
        </div>
      </template>
    </grid>
    <tag-modal
      ref="tagModal"
      v-model="showModalTag"
      :user="editTag"
      @saved="gridRef?.reloadGrid()"
    />
    <delete-modal
      ref="deleteModal"
      collection="tags"
      v-model="showDeleteModal"
      @deleted="gridRef?.reloadGrid"
    />
    <archive-modal ref="archiveModal" collection="tags" @archived="gridRef?.reloadGrid" />
    <archive-modal ref="restoreModal" collection="tags" @archived="gridRef?.reloadGrid" />
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
