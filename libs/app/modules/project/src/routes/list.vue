<script setup lang="ts">
import { ref } from 'vue';
import { defineVaDataTableColumns } from 'vuestic-ui/web-components';
import { useI18n } from 'vue-i18n';

import { AvalilableCollections, Project, CrudActions, CommonActions } from '@owl-app/lib-contracts';

import Grid from '@owl-app/lib-app-core/components/grid/grid.vue';
import StringFilter from '@owl-app/lib-app-core/components/grid/components/filters/string.vue';
import SelectFilter from '@owl-app/lib-app-core/components/grid/components/filters/select.vue';
import ArchivedFilter from '@owl-app/lib-app-core/components/grid/components/filters/archived.vue';
import DeleteModal from '@owl-app/lib-app-core/components/modal/delete-modal.vue';
import ArchiveModal from '@owl-app/lib-app-core/components/modal/archive-modal.vue';
import { usePermissions } from '@owl-app/lib-app-core/composables/use-permissions';

import ProjectModal from '../components/project-modal.vue';

const { t } = useI18n();

const showModal = ref(false);
const showDeleteModal = ref(false);
const projectModal = ref<InstanceType<typeof ProjectModal>>();
const deleteModal = ref<InstanceType<typeof DeleteModal>>();
const archiveModal = ref<InstanceType<typeof ArchiveModal>>();
const restoreModal = ref<InstanceType<typeof ArchiveModal>>();
const gridRef = ref<InstanceType<typeof Grid>>();

const { hasRoutePermission } = usePermissions(AvalilableCollections.PROJECT);

const headerBar = {
  title: t('projects'),
  description: 'Managing projects in system',
  icon: 'source_notes',
};

const columns = defineVaDataTableColumns([
  { label: 'Name', key: 'name', sortable: true, tdClass: ['is-line-through'] },
  { label: ' ', key: 'actions' },
]);
const getRowBind = (row: Project): Record<string, string> => {
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
      url="projects"
      default-sort="id"
      :columns="columns"
      :default-filters="{ archived: 'all' }"
      :headerBar="headerBar"
      :row-bind="getRowBind"
    >
      <template #header-bar-actions>
        <va-button
          preset="primary"
          size="medium"
          color="primary"
          icon="mso-add"
          aria-label="Add role"
          @click="projectModal?.show(null)"
          v-if="hasRoutePermission(CrudActions.CREATE)"
        >
          Add project
        </va-button>
      </template>

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
          <div class="col-start-6 col-end-9">
            <select-filter
              url="clients?pageable=0"
              label="Clients"
              name="clients"
              textBy="name"
              trackBy="id"
              :clearable="true"
              :data="filters?.clients"
              :change-filter="changeFilter"
              :remove-filter="removeFilter"
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

      <template #cell(actions)="{ rowData: project }">
        <div class="flex gap-2 justify-end">
          <va-button
            preset="primary"
            size="small"
            color="primary"
            icon="mso-edit"
            aria-label="Edit project"
            @click="projectModal?.show(project)"
            v-if="hasRoutePermission(CrudActions.UPDATE)"
          />
          <va-menu :autoPlacement="false">
            <template #anchor>
              <va-icon class="mt-0.5" name="more_vert" />
            </template>

            <va-menu-item
              @selected="archiveModal?.show(true, project?.id)"
              v-if="hasRoutePermission(CommonActions.ARCHIVE) && !project?.archived"
            >
              <va-icon name="archive" class="material-symbols-outlined mr-1" /> archive
            </va-menu-item>

            <va-menu-item
              @selected="restoreModal?.show(false, project?.id)"
              v-if="hasRoutePermission(CommonActions.ARCHIVE) && project?.archived"
            >
              <va-icon name="restore_page" class="material-symbols-outlined mr-1" /> restore
            </va-menu-item>

            <va-menu-item
              @selected="deleteModal?.show(project?.id)"
              v-if="hasRoutePermission(CrudActions.DELETE) && project?.archived"
            >
              <va-icon name="delete" color="danger" class="material-symbols-outlined mr-1" />
              <span style="color: var(--va-danger)"> delete</span>
            </va-menu-item>
          </va-menu>
        </div>
      </template>
    </grid>
    <project-modal ref="projectModal" v-model="showModal" @saved="gridRef?.reloadGrid()" />
    <delete-modal
      ref="deleteModal"
      collection="projects"
      v-model="showDeleteModal"
      @deleted="gridRef?.reloadGrid"
    />
    <archive-modal ref="archiveModal" collection="projects" @archived="gridRef?.reloadGrid" />
    <archive-modal ref="restoreModal" collection="projects" @archived="gridRef?.reloadGrid" />
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
