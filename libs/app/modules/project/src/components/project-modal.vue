<template>
  <VaModal v-slot="{ cancel, ok }" v-model="model" ok-text="Apply" hide-default-actions>
    <h3 class="va-h5">{{ item ? 'Edit' : 'Create' }} project</h3>
    <owl-form
      class-form="flex flex-col gap-2"
      collection="projects"
      :primaryKey="item?.id"
      @saved="
        ok();
        $emit('saved');
      "
    >
      <template #fields="{ data, validation }">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <va-input
              v-model="data.ref.name"
              label="Name"
              name="name"
              :error="!!validation['name']"
              :error-messages="validation['name']"
              :required-mark="true"
            />
          </div>
          <div>
            <client-select
              v-model="data.ref.client"
              label="Client"
              name="client"
              :error="!!validation['client']"
              :error-messages="validation['client']"
              :required-mark="true"
            />
          </div>
        </div>
      </template>

      <template #actions="{ validate, save, isLoading, isValid }">
        <div class="flex justify-end flex-col-reverse sm:flex-row mt-4 gap-2">
          <va-button :disabled="isLoading" preset="secondary" color="secondary" @click="cancel"
            >Cancel</va-button
          >
          <va-button :disabled="!isValid" @click="validate() && save()">Save</va-button>
        </div>
      </template>
    </owl-form>
  </VaModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import OwlForm from '@owl-app/lib-app-core/components/form/form.vue';
import ClientSelect from '@owl-app/lib-app-core/components/form/select-client.vue';

const model = defineModel<boolean>();

defineExpose({
  show,
});

defineEmits<{
  (event: 'saved'): void;
}>();

const item = ref<any>({});

function show(data: any = {}): void {
  model.value = true;
  item.value = data;
}
</script>
