<template>
  <VaModal v-model="model" ok-text="Apply" hide-default-actions>
    <template #header>
      <header-bar
        :title="(item ? 'Edit' : 'Create') + ' role'"
        :icon="item ? 'edit' : 'add'"
        :bordered-bottom="true"
      />
    </template>
    <template #default="{ ok, cancel }">
      <owl-form
        class-form="flex flex-col gap-2"
        collection="rbac/roles"
        :primaryKey="item?.name"
        :default-value="defaultRole"
        :schema="roleValidationSchema"
        @saved="
          ok();
          $emit('saved');
        "
      >
        <template #fields="{ data, validation }">
          <va-input
            v-model="data.ref.setting.displayName"
            label="Display name"
            name="setting.displayName"
            :error="!!validation['setting.displayName']"
            :error-messages="validation['setting.displayName']"
            :required-mark="true"
          />
          <va-input
            v-model="data.ref.name"
            :disabled="!isEmpty(data.ref.createdAt)"
            label="Canonical name"
            name="name"
            :error="!!validation['name']"
            :error-messages="validation['name']"
            :required-mark="true"
          />
          <va-textarea
            v-model="data.ref.description"
            label="Description"
            min-rows="5"
            name="description"
            :error="!!validation['description']"
            :error-messages="validation['description']"
            :required-mark="true"
          />
          <va-input v-model="data.ref.setting.theme" label="Theme" min-rows="5" />
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
    </template>
  </VaModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { isEmpty } from 'lodash';

import { type Role, roleValidationSchema } from '@owl-app/lib-contracts';
import OwlForm from '@owl-app/lib-app-core/components/form/form.vue';

import HeaderBar from '@owl-app/lib-app-core/layouts/panel/components/header-bar.vue';

const model = defineModel<boolean>();

defineExpose({
  show,
});

defineEmits<{
  (event: 'saved'): void;
}>();

const defaultRole: Role = {
  name: '',
  description: '',
  setting: {
    displayName: '',
    theme: '',
  },
};
const item = ref<any>({});

function show(data: any = {}): void {
  model.value = true;
  item.value = data;
}
</script>
