<script lang="ts" setup>
import { ref } from 'vue';
import { DateTime } from 'luxon';
import { defineVaDataTableColumns } from 'vuestic-ui/web-components';

import {
  type Time,
  type Tag,
  type Project,
  AvalilableCollections,
  TimeActions,
} from '@owl-app/lib-contracts';

import { usePermissions } from '@owl-app/lib-app-core/composables/use-permissions';
import Grid from '@owl-app/lib-app-core/components/grid/grid.vue';
import StringFilter from '@owl-app/lib-app-core/components/grid/components/filters/string.vue';
import SelectFilter from '@owl-app/lib-app-core/components/grid/components/filters/select.vue';
import DateRangeFilter from '@owl-app/lib-app-core/components/grid/components/filters/date-range.vue';
import DeleteModal from '@owl-app/lib-app-core/components/modal/delete-modal.vue';
import { useApi } from '@owl-app/lib-app-core/composables/use-system';

import CreateInline from '../components/create-inline.vue';

type GroupedWeeksAndDaysItem = {
  sum: Duration;
  items: Record<string, Time[]>;
};

type GroupedWeeksAndDays = Record<string, Record<string, GroupedWeeksAndDaysItem>>;

const api = useApi();
const { hasRoutePermission } = usePermissions(AvalilableCollections.TIME);

const gridRef = ref<InstanceType<typeof Grid>>();
const showDeleteModal = ref(false);
const deleteTime = ref<Time>();
const deleteModal = ref<InstanceType<typeof DeleteModal>>();
const timerCreateInline = ref<InstanceType<typeof CreateInline>>();
const tags = ref<Tag[]>([]);
const projects = ref<Project[]>([]);
const loadingData = ref(false);

const columns = defineVaDataTableColumns([
  { label: 'Name', key: 'name', sortable: true },
  { label: ' ', key: 'actions' },
]);

loadData();

async function loadTags(): Promise<void> {
  const result = await api.get('tags?pageable=0');

  tags.value = result?.data?.items;
}

async function loadProjects(): Promise<void> {
  const result = await api.get('projects?pageable=0');

  projects.value = result?.data?.items;
}

async function loadData(): Promise<void> {
  loadingData.value = true;

  await Promise.all([loadTags(), loadProjects()]);

  loadingData.value = false;
}

function groupByWeek(items: Time[]) {
  function getWeekRange(date: string) {
    const curr = DateTime.fromISO(date);

    return {
      from: curr.startOf('week').toFormat('yyyy-MM-dd').toString(),
      to: curr.endOf('week').toFormat('yyyy-MM-dd').toString(),
    };
  }

  const groupedWeeks: GroupedWeeksAndDays = items.reduce((acc, obj) => {
    const { from, to } = getWeekRange(obj.timeIntervalStart as string);

    const weekKey = `${from} / ${to}`;
    const dateKey = DateTime.fromISO(obj.timeIntervalStart as string).toLocaleString(
      DateTime.DATE_FULL
    );

    if (!acc[weekKey]) {
      acc[weekKey] = {
        sum: DateTime.fromISO(obj.timeIntervalEnd as string).diff(
          DateTime.fromISO(obj.timeIntervalStart as string)
        ),
        items: {} as Record<string, Time[]>,
      };
    } else {
      acc[weekKey].sum = acc[weekKey].sum.plus(
        DateTime.fromISO(obj.timeIntervalEnd as string).diff(
          DateTime.fromISO(obj.timeIntervalStart as string)
        )
      );
    }

    if (!acc[weekKey].items[dateKey as string]) {
      acc[weekKey].items[dateKey as string] = {
        sum: DateTime.fromISO(obj.timeIntervalEnd as string).diff(
          DateTime.fromISO(obj.timeIntervalStart as string)
        ),
        items: [] as Time[],
      };
    } else {
      acc[weekKey].items[dateKey as string].sum = acc[weekKey].items[dateKey as string].sum.plus(
        DateTime.fromISO(obj.timeIntervalEnd as string).diff(
          DateTime.fromISO(obj.timeIntervalStart as string)
        )
      );
    }

    acc[weekKey].items[dateKey as string].items.push({
      ...obj,
      ...{
        timeIntervalStart: new Date(obj.timeIntervalStart),
        timeIntervalEnd: new Date(obj.timeIntervalEnd),
      },
    });

    return acc;
  }, {} as GroupedWeeksAndDays);

  Object.keys(groupedWeeks).forEach((weekKey) => {
    groupedWeeks[weekKey].items = Object.keys(groupedWeeks[weekKey].items)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .reduce((sortedAcc: { [date: string]: Time[] }, dateKey: string) => {
        sortedAcc[dateKey] = groupedWeeks[weekKey].items[dateKey];
        return sortedAcc;
      }, {});

    Object.keys(groupedWeeks[weekKey].items).forEach((dateKey) => {
      groupedWeeks[weekKey].items[dateKey].items.sort(
        (a, b) => (b.timeIntervalStart as Date).getTime() - (a.timeIntervalStart as Date).getTime()
      );
    });
  });

  const sortedByWeeks = Object.entries(groupedWeeks)
    .sort((a, b) => {
      const [fromA] = a[0].split('/');
      const [fromB] = b[0].split('/');

      return new Date(fromB).getTime() - new Date(fromA).getTime();
    })
    .reduce((acc: GroupedWeeksAndDays, [week, groupedItems]) => {
      acc[week] = groupedItems;
      return acc;
    }, {});

  return sortedByWeeks;
}

function getProjectUrlFilter(clientFitler: string | undefined): string {
  if (!clientFitler) {
    return '';
  }

  return `&filters[clients]=${clientFitler}`;
}

async function exportCsv(filters: Record<string, string | string[]>) {
  const response = await api.get('times/export-csv', {
    params: filters,
    responseType: 'blob',
  });

  const blob = new Blob([response?.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = 'timetracker-export.csv';
  a.click();

  window.URL.revokeObjectURL(url);
}
</script>

<template>
  <panel-layout>
    <create-inline
      ref="timerCreateInline"
      url="times"
      key="main-create"
      manual-name-storage="time-is-manual"
      :is-manual="true"
      :is-manual-only="false"
      :tag-options="tags"
      :project-options="projects"
      @saved="gridRef?.reloadGrid"
    >
      <template #actions="{ save, isManual, startTimer, isTimerStart }">
        <va-button v-if="!isManual && !isTimerStart" @click="startTimer()" class="w-full"
          >START</va-button
        >
        <va-button v-if="isManual" @click="save()" class="w-full">ADD</va-button>
      </template>
    </create-inline>

    <div class="mb-10" />

    <grid ref="gridRef" :columns="columns" defaultSort="id" url="times" layout="custom">
      <template #content-filter="{ filters, changeFilter, removeFilter }">
        <div
          class="grid grid-cols-16 gap-2 grid-flow-col"
          style="margin-left: auto; grid-auto-flow: column"
        >
          <div class="col-start-1 col-end-4">
            <date-range-filter
              label="Date"
              name="date"
              :model-value="filters?.date"
              :change-filter="changeFilter"
              :remove-filter="removeFilter"
            />
          </div>
          <div class="col-start-4 col-end-6">
            <select-filter
              url="clients?pageable=0"
              label="Clients"
              name="clients"
              textBy="name"
              trackBy="id"
              :data="filters?.clients"
              :clearable="true"
              :change-filter="changeFilter"
              :remove-filter="removeFilter"
            />
          </div>
          <div class="col-start-6 col-end-8">
            <select-filter
              :url="`projects?pageable=0${getProjectUrlFilter(filters?.clients)}`"
              label="Projects"
              name="projects"
              textBy="name"
              trackBy="id"
              :eagerLoading="!filters?.clients"
              :loading="loadingData"
              :options="projects"
              :data="filters?.projects"
              :clearable="true"
              :change-filter="changeFilter"
              :remove-filter="removeFilter"
            />
          </div>
          <div class="col-start-8 col-end-10">
            <select-filter
              url="tags"
              label="Tags"
              name="tags"
              textBy="name"
              trackBy="id"
              :loading="loadingData"
              :options="tags"
              :data="filters?.tags"
              :clearable="true"
              :change-filter="changeFilter"
              :remove-filter="removeFilter"
            />
          </div>
          <div class="col-start-10 col-end-13">
            <string-filter
              :data="filters?.search"
              :change-filter="changeFilter"
              :remove-filter="removeFilter"
            />
          </div>
        </div>
        <div class="my-2 text-right text-xs font-bold underline">
          <va-badge
            text="Export to CSV"
            class="cursor-pointer"
            color="secondary"
            @click="exportCsv(filters)"
            v-if="hasRoutePermission(TimeActions.EXPORT_CSV)"
          />
        </div>
        <div class="my-2">
          <va-divider />
        </div>
      </template>

      <template #custom="{ items, loading }">
        <va-inner-loading :loading="loading">
          <div v-for="(groupWeek, startWeek) in groupByWeek(items as Time[])" :key="startWeek">
            <div class="flex mb-4">
              <va-chip>{{ startWeek }}</va-chip>
              <div class="ml-auto content-center">
                <span class="text-xs">Week total:</span>
                <span class="font-bold text-lg ml-1">{{ groupWeek.sum.toFormat('hh:mm:ss') }}</span>
              </div>
            </div>
            <va-card
              v-for="(groupDay, startDay) in groupWeek.items"
              :key="startDay"
              class="card-time mb-4"
              square
              outlined
              bordered
            >
              <va-card-title>
                <div class="flex w-full normal-case">
                  <div class="content-center">{{ startDay }}</div>
                  <div class="ml-auto content-center">
                    <span class="text-xs font-thin">Total:</span>
                    <span class="text-lg ml-1">{{ groupDay.sum.toFormat('hh:mm:ss') }}</span>
                  </div>
                </div>
              </va-card-title>
              <va-card-content>
                <create-inline
                  v-for="time in groupDay.items"
                  :url="`times/${time.id}`"
                  :key="`${time.id}-${time.timeIntervalStart}-${time.timeIntervalEnd}`"
                  :default-value="time"
                  :is-saved-after-change="true"
                  :tag-options="[
                    ...tags,
                    ...time.tags.filter(
                      (tag) => tag.archived && !tags.find((existing) => tag.id === existing.id)
                    ),
                  ]"
                  :project-options="[
                    ...projects,
                    ...(projects?.find((project) => project.id === time?.project?.id)
                      ? []
                      : [time.project]),
                  ]"
                  @saved="gridRef?.reloadGrid"
                >
                  <template #actions>
                    <va-divider vertical />
                    <va-icon
                      name="play_arrow"
                      :size="44"
                      class="material-symbols-outlined"
                      aria-label="Update time"
                      @click="() => timerCreateInline?.startTimer(time)"
                    />
                    <va-divider vertical />
                    <div class="flex items-center w-24">
                      <va-button
                        color="danger"
                        icon="delete"
                        aria-label="Delete time"
                        @click="deleteModal?.show(time?.id)"
                        size="small"
                      />
                    </div>
                  </template>
                </create-inline>
              </va-card-content>
            </va-card>
          </div>
        </va-inner-loading>
      </template>
    </grid>
    <delete-modal
      ref="deleteModal"
      collection="times"
      v-model="showDeleteModal"
      :primaryKey="deleteTime?.id"
      @deleted="gridRef?.reloadGrid"
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

    .va-card {
      .card-time {
        --va-card-padding: 0px;
        --va-card-outlined-border: thin solid #e0e0e0;

        .va-card-title {
          font-size: 0.75rem;
          font-weight: bold;
          padding: 0.75rem !important;
          background-color: #f5f5f5;
          border-bottom: var(--va-card-outlined-border);
          border-radius: 0;
        }

        .time-tracker-inline {
          border-bottom: var(--va-card-outlined-border);
        }
      }
    }
  }
}
</style>
