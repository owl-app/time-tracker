import axios from 'axios';
import { isEqual, throttle } from 'lodash';
import type { ComputedRef, Ref, WritableComputedRef } from 'vue';
import { computed, ref, unref, watch } from 'vue';

import type { Item } from '../types/item';
import type { Query } from '../types/query';
import api from '../services/api';
import { delay } from '../utils/delay';

export type ManualSortData = {
  item: string | number;
  to: string | number;
};

export type UsableItems = {
  totalCount: Ref<number>;
  items: Ref<Record<string, any>[]>;
  totalPages: ComputedRef<number>;
  loading: Ref<boolean>;
  error: Ref<any>;
  getItems: () => Promise<void>;
  reset: () => void;
  addItem: (item: Item) => void;
};

export type ComputedQuery = {
  limit: Ref<Query['limit']> | WritableComputedRef<Query['limit']>;
  sort: Ref<Query['sort']> | WritableComputedRef<Query['sort']>;
  filter: Ref<Query['filter']> | WritableComputedRef<Query['filter']>;
  page: Ref<Query['page']> | WritableComputedRef<Query['page']>;
};

export function useItems(url: string, query: ComputedQuery): UsableItems {
  const { limit, sort, filter, page } = query;

  const items = ref<Item[]>([]);
  const loading = ref(true);
  const error = ref<any>(null);
  const totalCount = ref<number>(0);

  const totalPages = computed(() => {
    if (totalCount.value === 0) return 1;
    if (totalCount.value < (unref(limit) ?? 100)) return 1;
    return Math.ceil(totalCount.value / (unref(limit) ?? 100));
  });

  const existingRequests: Record<'items' | 'total' | 'filter', AbortController | null> = {
    items: null,
    total: null,
    filter: null,
  };

  let firstLoad = true;
  let loadingTimeout: number | null = null;

  const fetchItems = throttle(getItems, 500);

  watch(
    [limit, sort, filter, page],
    async (after, before) => {
      if (firstLoad) {
        firstLoad = false;
        fetchItems();
        return;
      }

      if (isEqual(after, before)) return;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [newLimit, newSort, newFilter, newPage] = after;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [oldLimit, oldSort, oldFilter, oldPage] = before;

      if (!isEqual(newFilter, oldFilter) || newLimit !== oldLimit) {
        page.value = 1;

        if (newPage !== oldPage) {
          return;
        }
      }

      fetchItems();
    },
    { deep: true, immediate: true }
  );

  return {
    items,
    totalCount,
    totalPages,
    loading,
    error,
    getItems,
    reset,
    addItem,
  };

  async function getItems() {
    let isCurrentRequestCanceled = false;

    if (existingRequests.items) existingRequests.items.abort();
    existingRequests.items = new AbortController();

    error.value = null;

    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }

    loadingTimeout = setTimeout(() => {
      loading.value = true;
    }, 150);

    try {
      await delay(500);
      const response = await api.get<any>(url, {
        params: {
          limit: unref(limit),
          sort: unref(sort),
          page: unref(page),
          filters: unref(filter),
        },
        signal: existingRequests.items.signal,
      });

      const fetchedItems = response.data.items;
      existingRequests.items = null;

      totalCount.value = response.data.metadata.total;

      items.value = fetchedItems;

      if (page && fetchedItems.length === 0 && page?.value !== 1) {
        page.value = 1;
      }
    } catch (err: any) {
      if (axios.isCancel(err)) {
        isCurrentRequestCanceled = true;
      } else {
        error.value = err;
      }
    } finally {
      if (loadingTimeout && !isCurrentRequestCanceled) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
      }

      if (!loadingTimeout) loading.value = false;
    }
  }

  function reset() {
    items.value = [];
    page.value = 1;
    filter.value = {};
    sort.value = [];
    limit.value = 10;
    firstLoad = true;
  }

  function addItem(item: Item) {
    items.value.unshift(item);
    totalCount.value += 1;
  }
}
