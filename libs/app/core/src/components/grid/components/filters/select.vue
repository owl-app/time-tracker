<script setup lang="ts">
import { isEqual } from 'lodash';
import { PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { Archivable } from '@owl-app/lib-contracts';

import { useApi } from '../../../../composables/use-system';

const props = defineProps({
  data: {
    type: null as unknown as PropType<string | null>,
    required: true,
    nullable: true,
    default: null,
  },
  url: {
    type: String,
    required: false,
    default: '',
  },
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
  options: {
    type: null as unknown as PropType<any[] | null>,
    required: false,
  },
  label: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  textBy: {
    type: String,
    required: true,
  },
  trackBy: {
    type: String,
    required: true,
  },
  changeFilter: {
    type: Function as PropType<Function>,
    required: true,
  },
  removeFilter: {
    type: Function as PropType<Function>,
    required: true,
  },
  clearable: {
    type: Boolean,
    required: false,
    default: false,
  },
  eagerLoading: {
    type: Boolean,
    required: false,
    default: false,
  },
});

defineEmits(['clear']);
const model = ref<any[]>([]);

const api = useApi();
const { t } = useI18n();

const availableOptions = ref<any[]>([]);
const loadingData = ref(props.loading);

if (!props.eagerLoading) {
  loadData();
}

watch(
  () => [props.data],
  () => {
    const dataFromFilter = getValuesFromFilter();

    if (!isEqual(dataFromFilter, model.value)) {
      model.value = dataFromFilter;
    }
  }
);

watch(
  () => [props.url],
  async () => {
    await loadData();

    props.changeFilter({
      [props.name]: model.value.map((item: any) => item[props.trackBy]).join(','),
    });
  }
);

watch(
  () => [props.loading],
  async () => {
    if (props.options && props.eagerLoading) {
      availableOptions.value = props.options.map((item: unknown) => getOption(item));
      model.value = getValuesFromFilter();
    }

    loadingData.value = props.loading;
  },
  { immediate: true }
);

async function loadData() {
  loadingData.value = true;

  const result = await api.get(props.url);

  availableOptions.value = result?.data?.items?.map((item: unknown) => getOption(item)) ?? [];

  model.value = getValuesFromFilter();

  loadingData.value = false;
}

function change() {
  if (model.value.length === 0) {
    props.removeFilter(props.name);

    return;
  }

  props.changeFilter({
    [props.name]: model.value.map((item: any) => item[props.trackBy]).join(','),
  });
}

function clear() {
  model.value = [];
  props.removeFilter(props.name);
}

function getValuesFromFilter() {
  return availableOptions?.value.filter((option: any) => {
    return props.data?.split(',').includes(option[props.trackBy]);
  });
}

function getOption(item: any) {
  return {
    [props.trackBy as string]: item[props.trackBy],
    [props.textBy]: item[props.textBy],
    archived: item?.archived ?? false,
  };
}
</script>

<template>
  <va-select
    v-model="model"
    searchable
    multiple
    background="#fff"
    :label="`${t(label)}`"
    :placeholder="`${t('select_option')}`"
    :options="availableOptions"
    :clearable="clearable"
    :text-by="textBy"
    :track-by="trackBy"
    :loading="loadingData"
    @clear="clear"
    @update:isOpen="(isOpen: boolean) => !isOpen && change()"
  >
    <template #content="{ valueArray }">
      <va-badge
        v-for="v in valueArray"
        :class="`mr-0.5 mt-0.5 ${v?.archived ? 'line-through' : ''}`"
        :color="v.color ?? 'primary'"
        :text="v.name"
        :key="v"
      />
    </template>
    <template #option-content="{ option }">
      <div :class="(option as Archivable)?.archived ? 'line-through' : ''">
        {{ option[props.textBy] }}
      </div>
    </template>
  </va-select>
</template>
