<script setup lang="ts">
import { isEqual, isEmpty, omit } from 'lodash';
import { computed, PropType, ref, watch } from 'vue';
import { LocationQueryRaw, useRoute, useRouter } from 'vue-router';
// eslint-disable-next-line import/no-unresolved
import { DataTableColumnSource, DataTableRowBind } from 'vuestic-ui/web-components';

import HeaderBar, {
  type Props as HeaderBarProps,
} from '../../layouts/panel/components/header-bar.vue';

import { useItems } from '../../composables/use-items';

export type LayoutTypes = 'table' | 'custom';

const props = defineProps({
  url: {
    type: String as PropType<string>,
    required: true,
  },
  headerBar: {
    type: Object as PropType<HeaderBarProps>,
    required: false,
  },
  columns: {
    type: Array as PropType<DataTableColumnSource[]>,
    required: true,
  },
  defaultFilters: {
    type: Object as PropType<object>,
    required: false,
  },
  defaultLimit: {
    type: Number as PropType<number>,
    required: false,
    default: 10,
  },
  availableLimit: {
    type: Array as PropType<number[]>,
    required: false,
    default: () => [10, 50, 100],
  },
  defaultSort: {
    type: String as PropType<string>,
    required: true,
  },
  layout: {
    type: String as PropType<LayoutTypes>,
    required: false,
    default: 'table',
  },
  grid: {
    type: Boolean as PropType<boolean>,
    required: false,
    default: false,
  },
  rowBind: {
    type: null as unknown as PropType<DataTableRowBind | undefined>,
  },
});

const router = useRouter();
const route = useRoute();
let filtersChanged = false;

const { sortRef: sort, limitRef: limit, pageRef: page, filterRef: filter } = useItemOptions();

const { items, loading, totalPages, totalCount, getItems, reset, addItem } = useItems(props.url, {
  limit,
  page,
  sort,
  filter,
});

defineExpose({
  reloadGrid,
  addItem,
});

const showingFrom = computed(() => {
  if (page.value > 1) {
    return limit.value * (page.value - 1);
  }

  return 1;
});

const showingTo = computed(() => {
  const to: number = limit.value * page.value;

  if (to > (totalCount?.value ?? 0)) {
    return totalCount;
  }

  return to;
});

const showLimit = computed(() => totalCount.value > Math.min(...props.availableLimit));

let firstLoad = true;

watch(
  () => route.query,
  () => {
    if (isEmpty(route.query)) {
      reset();
      firstLoad = true;
    }
  }
);

watch(
  [limit, sort, filter, page],
  (after, before) => {
    if (isEqual(after, before)) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [newLimit, newSort, newFilter, newPage] = after;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [oldLimit, oldSort, oldFilter, oldPage] = before;

    if (newPage !== oldPage && !firstLoad) {
      router.push({ query: { ...route.query, page: page.value } });
    }

    if (newLimit !== oldLimit && !firstLoad) {
      router.push({ query: { ...route.query, limit: limit.value, page: 1 } });
    }

    if (!isEqual(newFilter, oldFilter) && !firstLoad) {
      filtersChanged = true;
      router.push({
        query: {
          ...route.query,
          ...{ filters: filter.value },
          page: 1,
        } as unknown as LocationQueryRaw,
      });
    }

    firstLoad = false;
  },
  { deep: true, immediate: true }
);

const changeFilter = (data: any) => {
  filter.value = {
    ...filter.value,
    ...data,
  };
};

const removeFilter = (key: string) => {
  filter.value = omit(filter.value, key);
};

function useItemOptions() {
  const pageRef = ref(route.query.page ? parseInt(route.query.page as string, 10) : 1);
  const limitRef = ref(
    route.query.limit ? parseInt(route.query?.limit as string, 10) : props.defaultLimit
  );
  const sortRef = ref([props.defaultSort]);
  const filterRef = ref(
    (route.query?.filters as Record<string, any>) ?? props.defaultFilters ?? {}
  );

  return { pageRef, limitRef, sortRef, filterRef };
}

async function reloadGrid() {
  await getItems();
}
</script>

<template>
  <div class="wrapper-grid">
    <header-bar
      v-if="headerBar"
      :title="headerBar?.title"
      :description="headerBar?.description"
      :icon="headerBar?.icon"
    >
      <template #actions>
        <slot name="header-bar-actions" />
      </template>
    </header-bar>
    <va-card style="margin-bottom: 10px" v-if="!!$slots.filters">
      <va-card-content>
        <va-collapse
          :model-value="!isEmpty(filter) || filtersChanged"
          class="min-w-96"
          header="Filters"
          icon="filter_list"
        >
          <slot
            name="filters"
            :filters="filter"
            :change-filter="changeFilter"
            :remove-filter="removeFilter"
          />
        </va-collapse>
      </va-card-content>
    </va-card>
    <slot
      name="content-filter"
      :filters="filter"
      :change-filter="changeFilter"
      :remove-filter="removeFilter"
      v-if="$slots['content-filter']"
    />

    <va-card>
      <va-card-content>
        <slot name="custom" v-if="props.layout === 'custom'" v-bind="{ items, loading }" />
        <va-data-table
          :items="items"
          :columns="columns"
          :loading="loading"
          :per-page="limit"
          :grid="props.grid"
          :hideDefaultHeader="props.grid"
          :row-bind="props.rowBind"
          v-if="props.layout === 'table'"
        >
          <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope" />
          </template>
        </va-data-table>

        <div class="wrapper-bottom">
          <div
            class="flex flex-col-reverse md:flex-row gap-2 justify-between items-top py-2"
            v-if="showLimit"
          >
            <div>
              Results per page
              <VaSelect v-model="limit" class="!w-20" :options="availableLimit" />
            </div>
            <div v-if="totalPages > 1" class="flex">
              <va-button
                preset="secondary"
                icon="va-arrow-left"
                aria-label="Previous page"
                :disabled="page === 1"
                @click="page--"
              />
              <va-button
                class="mr-2"
                preset="secondary"
                icon="va-arrow-right"
                aria-label="Next page"
                :disabled="page === totalPages"
                @click="page++"
              />
              <va-pagination
                v-model="page"
                buttons-preset="secondary"
                :pages="totalPages"
                :visible-pages="limit"
                :boundary-links="false"
                :direction-links="false"
              />
            </div>
          </div>
          <div class="count-results" v-if="items.length > 0">
            <b>Showing {{ showingFrom }} - {{ showingTo }} of {{ totalCount }} results</b>
          </div>
        </div>
      </va-card-content>
    </va-card>
  </div>
</template>
<style lang="scss">
.wrapper-grid {
  .va-data-table {
    &__table-thead {
      background-color: var(--va-background-primary);
    }
  }
  .va-card {
    .va-data-table {
      &--grid {
        .va-data-table {
          &__table-thead {
            display: none;
          }
        }
        .va-inner-loading {
          &__spinner {
            margin: 0;
          }
        }
      }
    }

    .va-inner-loading {
      --va-inner-loading-min-height: 200px;

      &--active {
        min-height: var(--va-inner-loading-min-height);
        .va-data-table {
          &__table-tbody {
            &:has(.no-data) {
              visibility: hidden;
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
:deep() {
  .va-collapse {
    &--expanded {
      .va-collapse {
        &__header {
          margin-bottom: calc(var(--va-collapse-padding) / 1.5);
        }
      }
    }

    &__body-wrapper {
      &--bordered {
        border-bottom: 0;
      }
    }

    &__content {
      padding: 0;
      padding-top: calc(var(--va-collapse-padding) / 1);
      border-top: 1px solid var(--va-background-border);

      &:empty {
        padding: 0;
      }
    }

    &__header {
      padding: 0;
    }
  }
  .wrapper-bottom {
    padding-top: 0.8rem;
    border-top: 1px solid var(--va-background-border);

    .count-results {
      text-align: right;
      margin-top: 0.5rem;
    }
  }
}
</style>
