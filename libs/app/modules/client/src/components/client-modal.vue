<template>
  <VaModal v-slot="{ cancel, ok }" v-model="model" ok-text="Apply" hide-default-actions>
    <h3 class="va-h5">{{ item ? 'Edit' : 'Create' }} client</h3>
    <owl-form
      class-form="flex flex-col gap-2"
      collection="clients"
      :primaryKey="item?.id"
      :schema="updateClientValidationSchema"
      @saved="
        ok();
        $emit('saved');
      "
    >
      <template #fields="{ data, validation }">
        <va-input
          v-model="data.ref.name"
          label="name"
          name="name"
          :error="!!validation['name']"
          :error-messages="validation['name']"
          :required-mark="true"
        />
        <va-input
          v-model="data.ref.email"
          label="email"
          name="email"
          :error="!!validation['email']"
          :error-messages="validation['email']"
          :required-mark="true"
        />
        <va-textarea
          v-model="data.ref.addess"
          label="address"
          min-rows="5"
          name="address"
          :error="!!validation['address']"
          :error-messages="validation['address']"
          :required-mark="true"
        />
        <va-textarea
          v-model="data.ref.description"
          label="description"
          min-rows="5"
          name="description"
          :error="!!validation['description']"
          :error-messages="validation['description']"
          :required-mark="true"
        />
      </template>

      <template #actions="{ validate, save, isLoading }">
        <div class="flex justify-end flex-col-reverse sm:flex-row mt-4 gap-2">
          <va-button :disabled="isLoading" preset="secondary" color="secondary" @click="cancel"
            >Cancel</va-button
          >
          <va-button @click="validate(true) && save()">Save</va-button>
        </div>
      </template>
    </owl-form>
  </VaModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { updateClientValidationSchema } from '@owl-app/lib-contracts';
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
