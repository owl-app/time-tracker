<template>
  <VaModal v-slot="{ cancel, ok }" v-model="model" ok-text="Apply" hide-default-actions>
    <h3 class="va-h5">{{ item ? 'Edit' : 'Create' }} tag</h3>
    <owl-form
      class-form="flex flex-col gap-2"
      collection="tags"
      :primaryKey="item?.id"
      @saved="
        ok();
        $emit('saved');
      "
    >
      <template #fields="{ data, validation }">
        <div class="grid grid-cols-3 gap-4">
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
          <div class="col-span-2">
            <va-color-input
              v-model="data.ref.color"
              label="Color"
              name="color"
              :error="!!validation['color']"
              :error-messages="validation['color']"
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

const model = defineModel<boolean>();

defineEmits<{
  (event: 'saved'): void;
}>();

defineExpose({
  show,
});

const item = ref<any>({});

function show(data: any = {}): void {
  model.value = true;
  item.value = data;
}
</script>
