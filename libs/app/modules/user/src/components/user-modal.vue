<template>
  <VaModal v-model="model" ok-text="Apply" hide-default-actions>
    <template #header>
      <header-bar
        :title="(user ? 'Edit' : 'Create') + ' user'"
        :icon="user ? 'edit' : 'add'"
        :bordered-bottom="true"
      />
    </template>
    <template #default="{ ok, cancel }">
      <owl-form
        class-form="flex flex-col gap-2"
        collection="users"
        :primaryKey="user?.id"
        :schema="user?.id ? updateUserValidationSchema : createUserValidationSchema"
        @saved="
          ok();
          $emit('saved');
        "
      >
        <template #fields="{ data, validation }">
          <va-input
            v-model="data.ref.email"
            label="E-mail"
            name="email"
            :error="!!validation['email']"
            :error-messages="validation['email']"
            :required-mark="true"
          />
          <div>
            <roles-select v-model="data.ref.role" :validation="validation" />
          </div>
          <va-input
            v-model="data.ref.password"
            label="Password"
            name="password"
            :error="!!validation['password']"
            :error-messages="validation['password']"
            :required-mark="true"
          />
          <va-input v-model="data.ref.firstName" label="firstName" :rules="[required]" />
          <va-input v-model="data.ref.lastName" label="lastName" :rules="[required]" />
          <va-input v-model="data.ref.phoneNumber" label="phoneNumber" :rules="[required]" />
        </template>

        <template #actions="{ save, validate, isLoading }">
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
import {
  type User,
  createUserValidationSchema,
  updateUserValidationSchema,
} from '@owl-app/lib-contracts';
import OwlForm from '@owl-app/lib-app-core/components/form/form.vue';
import HeaderBar from '@owl-app/lib-app-core/layouts/panel/components/header-bar.vue';

import RolesSelect from './roles-select.vue';

const model = defineModel<boolean>();

defineEmits<{
  (event: 'saved'): void;
}>();

defineProps<{
  user?: User | null;
}>();

const required = (v: string) => !!v || 'This field is required';
</script>
