<script setup lang="ts">
import { DateTime } from 'luxon';
import { PropType } from 'vue';
import {
  DateInputDate,
  DateInputModelValue,
  DateInputRange,
} from 'vuestic-ui/dist/types/components/va-date-input/types';

const model = defineModel<DateInputRange<DateInputDate> | null>();

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  data: {
    type: Object as PropType<{ start?: string; end?: string } | null>,
    required: false,
    default: () => null,
  },
  label: {
    type: String as PropType<string>,
    required: false,
  },
  changeFilter: {
    type: Function as PropType<Function>,
    required: true,
  },
  removeFilter: {
    type: Function as PropType<Function>,
    required: true,
  },
});

function change() {
  if (model?.value?.start === null && model.value.end === null) {
    props.removeFilter(props.name);
    model.value = null;

    return;
  }

  props.changeFilter({
    [props.name]: model.value,
  });
}

function clear() {
  model.value = null;
  props.removeFilter(props.name);
}

function formatDate(date: Date): string {
  return DateTime.fromJSDate(new Date(date ?? '')).toFormat('LLL dd, yyyy');
}

function formatValue(date: DateInputModelValue): string {
  return DateTime.fromJSDate(new Date(date as string)).toFormat('yyyy-MM-dd');
}
</script>

<template>
  <div class="date-range-filter">
    <va-date-input
      v-model="model"
      mode="range"
      firstWeekday="Monday"
      class="date-range-filter"
      background="#fff"
      placeholder="Select date"
      rangeDelimiter=" - "
      :format-date="formatDate"
      :format-value="formatValue"
      :clearable="true"
      :label="label"
      :resetOnClose="false"
      :highlightWeekend="true"
      @clear="clear"
      @update:isOpen="(isOpen: boolean) => !isOpen && change()"
    />
  </div>
</template>

<style lang="scss" scoped>
:deep() {
  .va-input-wrapper {
    width: 100%;

    &__size-keeper {
      --va-input-wrapper-width: 100%;
    }
  }
}
</style>
