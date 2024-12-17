<template>
  <VaModal
    v-slot="{ cancel }"
    v-model="model"
    ok-text="Apply"
    hide-default-actions
    :title="archived ? 'archive' : 'restore'"
  >
    <strong>Are you sure you want to {{ archived ? 'archive' : 'restore' }} ?</strong>
    <div class="flex justify-end flex-col-reverse sm:flex-row mt-4 gap-2">
      <va-button :disabled="archiving" preset="secondary" color="secondary" @click="cancel"
        >Cancel</va-button
      >
      <va-button :loading="archiving" color="danger" @click="onDelete">{{
        archived ? 'Archive' : 'Restore'
      }}</va-button>
    </div>
  </VaModal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import type { Item, PrimaryKey } from '../../types/item';
import { useItem } from '../../composables/use-item';

const props = defineProps<{
  collection: string;
}>();

const archived = ref(false);

const emit = defineEmits<{
  (event: 'archived'): void;
}>();

defineExpose({
  show,
});

const model = defineModel<boolean>();

const { primaryKey, archiving, archive } = useItem<Item>(props.collection);

const onDelete = async () => {
  await archive(archived.value);

  emit('archived');

  model.value = false;
};

function show(isArchived: boolean, id?: PrimaryKey): void {
  model.value = true;
  primaryKey.value = id;
  archived.value = isArchived;
}
</script>
