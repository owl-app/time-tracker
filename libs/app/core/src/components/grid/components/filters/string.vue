<script setup lang="ts">
import { debounce, DebouncedFunc } from 'lodash';
import { reactive, watch, PropType } from 'vue';
import { isEmpty } from '@owl-app/utils';

export type SelectTypeOption = {
  value: string;
  text?: string;
};

const props = defineProps({
  data: {
    type: Object as PropType<{ type: string; value: string }>,
    required: true,
    default: () => ({ type: 'equal', value: '' }),
  },
  changeFilter: {
    type: Function as PropType<Function>,
    required: true,
  },
  removeFilter: {
    type: Function as PropType<Function>,
    required: true,
  },
  singleFilter: {
    type: String as PropType<string>,
    required: false,
    default: '',
  },
  labelSearchInput: {
    type: String as PropType<string>,
    required: false,
    default: 'Search text',
  },
});

const types = [
  { value: 'equal', text: 'Equal' },
  { value: 'not_equal', text: 'Not equal' },
  { value: 'empty', text: 'Empty' },
  { value: 'not_empty', text: 'Not empty' },
  { value: 'contains', text: 'Contains' },
  { value: 'not_contains', text: 'Not contains' },
  { value: 'starts_with', text: 'Starts with' },
  { value: 'ends_with', text: 'Ends with' },
  { value: 'in', text: 'In' },
  { value: 'not_in', text: 'Not in' },
];

const form: { type: SelectTypeOption; text: string } = reactive({
  type: {
    value: props.data?.type,
    text: types.filter((t) => t.value === props.data?.type)[0]?.text,
  },
  text: props.data?.value,
});

let textDebounce: DebouncedFunc<(...args: any[]) => any>;

watch(
  () => props.data,
  () => {
    form.type = {
      value: props.data?.type,
      text: types.filter((t) => t.value === props.data?.type)[0]?.text,
    };
    form.text = props.data?.value;
  },
  { immediate: true }
);

function change(field: string) {
  const { type, text } = form;

  if (textDebounce) {
    textDebounce.cancel();
  }

  const searchType = props.singleFilter === '' ? type?.value : props.singleFilter;

  if (isEmpty(text) && !['not_empty', 'empty'].includes(searchType)) {
    if (field === 'text') props.removeFilter('search');

    return;
  }

  if (field === 'text') {
    textDebounce = debounce(() => {
      props.changeFilter({
        search: {
          type: searchType,
          value: text,
        },
      });
    }, 500);

    textDebounce();
  } else {
    props.changeFilter({
      search: {
        type: props.singleFilter === '' ? searchType : props.singleFilter,
        value: text,
      },
    });
  }
}

function clear() {
  form.text = '';

  if (props.singleFilter === '') {
    form.type = { value: 'equal', text: 'Equal' };
  }

  props.removeFilter('search');
}
</script>

<template>
  <div class="flex">
    <div class="flex-1">
      <div class="flex">
        <va-select
          v-model="form.type"
          class="w-36 mr-2"
          label="Type"
          background="#fff"
          :options="types"
          @update:modelValue="change('type')"
          v-if="singleFilter === ''"
        />
        <va-input
          v-model="form.text"
          class="flex-1"
          placeholder="Search"
          background="#fff"
          :label="labelSearchInput"
          @update:modelValue="change('text')"
        >
          <template #prependInner>
            <va-icon name="manage_search" class="search-input-icon mr-1" color="secondary" />
          </template>
        </va-input>
      </div>
    </div>
    <div class="clear w-8 ml-2">
      <button @click="clear">
        <va-icon class="material-symbols-outlined" name="close" size="small" color="danger" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep() {
  .search-input-icon {
    font-size: 1.5rem !important;
  }
  .clear {
    display: flex;
    align-items: end;
    justify-content: left;

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      border: 0.125rem solid var(--va-danger);
      font-weight: bold;
      margin-bottom: 0.4rem;
    }
  }
}
</style>
