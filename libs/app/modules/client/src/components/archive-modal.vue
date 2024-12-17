<template>
  <va-modal
    v-slot="{ cancel }"
    v-model="model"
    ok-text="Apply"
    hide-default-actions
    :title="archived ? 'archive' : 'restore'"
    @close="() => (withProjects = false)"
  >
    <va-inner-loading :loading="loading">
      <strong>Are you sure you want to {{ archived ? 'archive' : 'restore' }} ?</strong>
      <div class="flex mt-4">
        <va-checkbox
          v-model="withProjects"
          class="mb-6"
          color="primary"
          label="Archive all projects assigned to this client"
          v-if="item?.projects.length && !loading"
        />
      </div>
      <div class="flex justify-end flex-col-reverse sm:flex-row mt-4 gap-2">
        <va-button :disabled="archiving" preset="secondary" color="secondary" @click="cancel"
          >Cancel</va-button
        >
        <va-button :loading="archiving" color="danger" @click="onDelete">{{
          archived ? 'Archive' : 'Restore'
        }}</va-button>
      </div>
    </va-inner-loading>
  </va-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { Item, PrimaryKey } from '@owl-app/lib-app-core/types/item';
import { useItem } from '@owl-app/lib-app-core/composables/use-item';
import { usePermissions } from '@owl-app/lib-app-core/composables/use-permissions';
import { AvalilableCollections, CommonActions } from '@owl-app/lib-contracts';

const props = defineProps<{
  collection: string;
}>();

const emit = defineEmits<{
  (event: 'archived'): void;
}>();

defineExpose({
  show,
});

const model = defineModel<boolean>();

const { primaryKey, archiving, archive, item, loading, getItem } = useItem<Item>(props.collection);
const { hasRoutePermission } = usePermissions();

const archived = ref(false);
const withProjects = ref(false);

const onDelete = async () => {
  await archive(archived.value, { withProjects: withProjects.value });

  emit('archived');

  model.value = false;
};

function show(isArchived: boolean, id?: PrimaryKey): void {
  model.value = true;
  primaryKey.value = id;
  archived.value = isArchived;
  if (hasRoutePermission(CommonActions.ARCHIVE, AvalilableCollections.PROJECT)) {
    loadClient();
  }
}

async function loadClient() {
  if (primaryKey.value) {
    await getItem({ withProjects: 1 });
  }
}
</script>
