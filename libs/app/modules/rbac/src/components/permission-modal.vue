<template>
  <VaModal v-model="model" ok-text="Apply" hide-default-actions>
    <template #header>
      <header-bar
        :title="(item ? 'Edit' : 'Create') + ' permission'"
        :icon="item ? 'edit' : 'add'"
        :bordered-bottom="true"
      />
    </template>
    <template #default="{ ok, cancel }">
      <owl-form
        class-form="flex flex-col gap-2"
        collection="rbac/permissions"
        :primaryKey="item?.name"
        :schema="permissionValidationSchema"
        @saved="
          ok();
          $emit('saved');
        "
      >
        <template #fields="{ data, validation }">
          <div class="grid grid-cols-1">
            <va-textarea
              v-model="data.ref.description"
              name="description"
              label="Description"
              min-rows="5"
              :error="!!validation['description']"
              :error-messages="validation['description']"
              :required-mark="true"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <refer-select
              v-model="data.ref.refer"
              :disabled="!isEmpty(data.ref.createdAt)"
              name="refer"
              :error="!!validation['refer']"
              :error-messages="validation['refer']"
              :required-mark="true"
            />
            <collection-select
              v-model="data.ref.collection"
              :disabled="!isEmpty(data.ref.createdAt)"
              name="collection"
              :error="!!validation['collection']"
              :error-messages="validation['collection']"
              :required-mark="true"
            />
          </div>
          <va-input
            v-model="data.ref.name"
            :disabled="!isEmpty(data.ref.createdAt)"
            label="Canonical name"
            name="name"
            :error="!!validation['name']"
            :error-messages="validation['name']"
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
    </template>
  </VaModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { isEmpty } from 'lodash';

import { permissionValidationSchema } from '@owl-app/lib-contracts';
import OwlForm from '@owl-app/lib-app-core/components/form/form.vue';
import HeaderBar from '@owl-app/lib-app-core/layouts/panel/components/header-bar.vue';

import CollectionSelect from './form/collection-select.vue';
import ReferSelect from './form/refer-select.vue';

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
