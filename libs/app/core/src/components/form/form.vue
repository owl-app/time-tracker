<script lang="ts" setup>
import { computed, ref, watch, VNode, Fragment, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { debounce, DebouncedFunc, snakeCase } from 'lodash';
import * as v from 'valibot';
import { BaseSchema, BaseIssue, FlatErrors } from 'valibot';
import { useForm } from 'vuestic-ui';

import { isEmpty } from '@owl-app/utils';

import type { Item, PrimaryKey } from '../../types/item';
import { SaveMethodOptions, useItem } from '../../composables/use-item';

interface Props {
  collection: string;
  schema?: BaseSchema<unknown, unknown, BaseIssue<unknown>> | null;
  primaryKey?: PrimaryKey | undefined;
  defaultValue?: Item | null;
  classForm?: string;
  clearFormAfterSave?: boolean;
  action?: string;
}

const props = withDefaults(defineProps<Props>(), {
  clearFormAfterSave: true,
});

const emit = defineEmits<{
  (event: 'saved', dataSaved: any, formData: Ref): void;
}>();

const { t } = useI18n();
const formData = ref({ ...(props.defaultValue ?? {}) });
const validationErrors = ref<any>({});
const { primaryKey, item, loading, saving, validationServerErrors, getItem, save, action } =
  useItem<Item>(props.collection, props.primaryKey);

const { fields } = useForm('owl-form');
const isValid = ref(!props?.schema);

const isFormHasUnsavedChanges = computed(() => {
  return Object.keys(formData.value).some((key) => {
    return (
      formData.value[key as keyof Item] !== (item.value ?? props.defaultValue)?.[key as keyof Item]
    );
  });
});

let immediateValidation = false;
let textDebounce: DebouncedFunc<(...args: any[]) => any>;

defineExpose({
  isFormHasUnsavedChanges,
  formData,
  validationErrors,
  validationServerErrors,
});

watch(
  () => [props.primaryKey, props.action],
  async (): Promise<void> => {
    if (!props.primaryKey) {
      primaryKey.value = null;
      validate();
    } else {
      primaryKey.value = props.primaryKey;
    }

    if (props.action) {
      action.value = props.action;
    }

    if (props.primaryKey || props.action) {
      await getItem();

      immediateValidation = true;

      formData.value = {
        ...item.value,
      };
    }
  },
  { immediate: true }
);

watch(
  [formData],
  () => {
    if (immediateValidation) {
      validate();
      immediateValidation = false;
    } else {
      debouceValidate(1000);
    }
  },
  { deep: true }
);

watch(
  () => validationServerErrors.value,
  () => {
    if (!isEmpty(validationServerErrors.value)) {
      validationErrors.value = getErrors(validationServerErrors.value, true);
      isValid.value = false;
    } else {
      isValid.value = true;
    }
  },
  { deep: true }
);

const getUnSlottedVNodes = (nodes: VNode[]) => {
  if (Array.isArray(nodes) && nodes[0].type === Fragment) {
    return nodes[0].children as VNode[];
  }

  return nodes;
};

function validate(showAllErrors = false): boolean {
  clearServerValidationErrors();

  if (!props.schema) return true;

  if (textDebounce) {
    textDebounce.cancel();
  }

  const result = v.safeParse(props.schema, { ...formData.value });

  if (result.issues) {
    const flattenResult = v.flatten(result.issues)?.nested ?? {};

    validationErrors.value = getErrors(flattenResult, showAllErrors);
    isValid.value = false;

    return false;
  }

  validationErrors.value = {};
  isValid.value = true;

  return true;
}

function getErrors(
  flatErrors: FlatErrors<undefined>['nested'],
  showAllErrors = false
): Record<string, string> {
  let errors = {};

  fields.value.forEach((field) => {
    if (
      (field.isDirty || field.isTouched || showAllErrors) &&
      field.name !== undefined &&
      flatErrors &&
      Object.keys(flatErrors).includes(field.name)
    ) {
      if (showAllErrors) {
        field.isTouched = true;
      }

      errors = {
        ...errors,
        ...{
          [field.name]: (flatErrors[field.name] ?? []).map((error) => {
            return t(`validation.${snakeCase(error.replace(/\s+/g, '_'))}`);
          }),
        },
      };
    }
  });

  return errors;
}

function debouceValidate(time: number) {
  if (textDebounce) {
    textDebounce.cancel();
  }

  textDebounce = debounce(() => {
    validate();
  }, time);

  textDebounce();
}

const saveForm = async (method?: SaveMethodOptions) => {
  const savedData = await save(formData.value, method);

  if (isValid.value) {
    emit('saved', savedData, formData);
    validationErrors.value = {};

    if (props.clearFormAfterSave) {
      formData.value = {};
    }
  }
};

function clearServerValidationErrors() {
  fields.value.forEach((field) => {
    Object.keys(validationServerErrors.value).forEach((key) => {
      if (field.name === key && field.isDirty) {
        delete validationErrors.value[key];
        delete validationServerErrors.value[key];
      }
    });
  });
}

const makeSlotRef = () => {
  return new Proxy(formData, {
    get(value, key) {
      if (key === 'ref') {
        return formData.value;
      }

      return Reflect.get(v, key);
    },
    set(_, key, value) {
      if (key === 'ref') {
        formData.value = value;
        return true;
      }

      return Reflect.set(formData, key, value);
    },
  });
};
</script>

<template>
  <VaInnerLoading :loading="loading || saving">
    <va-form ref="owl-form" :class="classForm">
      <template v-if="$slots.fields">
        <template
          v-for="child in getUnSlottedVNodes(
            $slots.fields({ data: makeSlotRef(), validation: validationErrors })
          )"
          :key="child.key"
        >
          <component
            :is="child"
            @focusout="
              $event.stopPropagation();
              validate();
            "
          />
        </template>
      </template>

      <slot
        name="actions"
        :validate="validate"
        :save="saveForm"
        :is-valid="isValid"
        :is-loading="loading || saving"
        :data="makeSlotRef() as any"
      />
    </va-form>
  </VaInnerLoading>
</template>

<style lang="scss" scoped>
.va-select-content__autocomplete {
  flex: 1;
}

.va-input-wrapper__text {
  gap: 0.2rem;
}
</style>
