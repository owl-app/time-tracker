import type { ComputedRef, Ref } from 'vue';
import { computed, ref } from 'vue';
import { useToast } from 'vuestic-ui/web-components';

import { isEmpty } from '@owl-app/utils';

import api from '../services/api';
import { Item, PrimaryKey } from '../types/item';
import { i18n } from '../application/lang';
import { delay } from '../utils/delay';

export type ManualSortData = {
  item: string | number;
  to: string | number;
};

export type SaveMethodOptions = 'post' | 'put' | 'patch';

export type UsableItem<T extends Item> = {
  primaryKey: Ref<PrimaryKey | undefined | null>;
  item: Ref<T | null>;
  loading: Ref<boolean>;
  error: Ref<any>;
  getItem: (params?: Record<string, any>) => Promise<void>;
  isNew: ComputedRef<boolean>;
  saving: Ref<boolean>;
  save: (data: T, method?: SaveMethodOptions) => Promise<void | null>;
  deleting: Ref<boolean>;
  remove: () => Promise<void>;
  archiving: Ref<boolean>;
  archive: (value: boolean, custom: Record<string, any>) => Promise<void>;
  validationServerErrors: Ref<any>;
  action: Ref<string | null>;
};

export function useItem<T extends Item>(
  // change to collection like in directus with permissions
  collection: string,
  id?: PrimaryKey | undefined
): UsableItem<T> {
  const { init: notify } = useToast();

  const item: Ref<T | null> = ref(null);
  const loading = ref(false);
  const saving = ref(false);
  const deleting = ref(false);
  const archiving = ref(false);
  const action = ref<string | null>(null);
  const error = ref<any>(null);
  const validationServerErrors = ref<any>({});
  const primaryKey = ref<PrimaryKey | undefined | null>(id ?? null);
  const isNew = computed(() => isEmpty(primaryKey.value));

  const endpoint = computed(() => {
    if (isNew.value && !action.value) {
      return collection;
    }

    const actionUrl = action.value ? `${action.value}/` : '';
    const primaryKeyUrl = primaryKey.value ? encodeURIComponent(primaryKey.value as string) : '';

    return `${collection}/${actionUrl}${primaryKeyUrl}`;
  });

  return {
    primaryKey,
    item,
    loading,
    error,
    getItem,
    isNew,
    saving,
    save,
    deleting,
    remove,
    archiving,
    archive,
    validationServerErrors,
    action,
  };

  async function getItem(params?: Record<string, any>): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await delay(500);
      const response = await api.get(endpoint.value, { params });
      item.value = response.data;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }
  async function save(data: T, method?: SaveMethodOptions): Promise<void | null> {
    saving.value = true;
    let saveMethod = method;

    if (!method) {
      saveMethod = isNew.value ? 'post' : 'put';
    }

    try {
      await delay(500);

      const response = await api.request({
        url: endpoint.value,
        data,
        method: saveMethod,
      });

      notify({
        message: i18n.global.t(`item_${saveMethod === 'post' ? 'create' : 'update'}_success`, 1),
        color: 'success',
        position: 'bottom-right',
        offsetY: 30,
      });

      item.value = response.data;
      validationServerErrors.value = {};

      return response.data;
    } catch (errorResponse: any) {
      saveErrorHandler(errorResponse);
    } finally {
      saving.value = false;
    }

    return null;
  }

  async function remove() {
    deleting.value = true;

    try {
      await delay(500);
      await api.delete(endpoint.value);

      item.value = null;

      notify({
        message: i18n.global.t('item_delete_success', 1),
        color: 'success',
        position: 'bottom-right',
        offsetY: 30,
      });
    } catch (errorResponse) {
      error.value = errorResponse;
      throw errorResponse;
    } finally {
      deleting.value = false;
    }
  }

  async function archive(value: boolean, custom: Record<string, any> = {}) {
    archiving.value = true;
    action.value = 'archive';

    try {
      await delay(500);
      await api.patch(endpoint.value, { ...{ archived: value }, ...custom });

      item.value = null;

      notify({
        message: i18n.global.t(`item_${value ? 'archive' : 'restore'}_success`, 1),
        color: 'success',
        position: 'bottom-right',
        offsetY: 30,
      });
    } catch (errorResponse) {
      error.value = errorResponse;
      throw errorResponse;
    } finally {
      archiving.value = false;
      action.value = '';
    }
  }

  function saveErrorHandler(errorResponse: any) {
    if (errorResponse?.response?.data?.errors) {
      validationServerErrors.value = errorResponse.response.data.errors;
    } else {
      throw errorResponse;
    }
  }
}
