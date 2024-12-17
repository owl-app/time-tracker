<template>
  <VaModal
    v-slot="{ cancel }"
    v-model="model"
    ok-text="Apply"
    hide-default-actions
    title="Deleting"
  >
    <strong>Are you sure you want to delete ?</strong>
    <div class="flex justify-end flex-col-reverse sm:flex-row mt-4 gap-2">
      <va-button :disabled="deleting" preset="secondary" color="secondary" @click="cancel"
        >Cancel</va-button
      >
      <va-button :loading="deleting" color="danger" @click="onDelete">Delete</va-button>
    </div>
  </VaModal>
</template>

<script lang="ts" setup>
import type { Item, PrimaryKey } from '../../types/item';
import { useItem } from '../../composables/use-item';

const props = defineProps<{
  collection: string;
}>();

const emit = defineEmits<{
  (event: 'deleted'): void;
}>();

defineExpose({
  show,
});

const model = defineModel<boolean>();

const { primaryKey, deleting, remove } = useItem<Item>(props.collection);

const onDelete = async () => {
  await remove();

  emit('deleted');

  model.value = false;
};

function show(id?: PrimaryKey): void {
  model.value = true;
  primaryKey.value = id;
}
</script>
