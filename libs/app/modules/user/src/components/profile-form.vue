<template>
  <owl-form
    class-form="flex flex-col gap-2"
    collection="user"
    action="profile"
    :schema="profileUserValidationSchema"
    :clearFormAfterSave="false"
    @saved="$emit('saved')"
  >
    <template #fields="{ data, validation }">
      <va-input
        v-model="data.ref.firstName"
        label="firstName"
        name="firstName"
        :error="!!validation['firstName']"
        :error-messages="validation['firstName']"
      />
      <va-input
        v-model="data.ref.lastName"
        label="lastName"
        name="lastName"
        :error="!!validation['lastName']"
        :error-messages="validation['lastName']"
      />
      <va-input
        v-model="data.ref.phoneNumber"
        label="phoneNumber"
        name="phoneNumber"
        :error="!!validation['phoneNumber']"
        :error-messages="validation['phoneNumber']"
      />

      <va-badge text="Change password" color="primary" class="mt-5" />
      <div class="grid grid-cols-2 gap-4">
        <div>
          <va-input
            v-model="data.ref.passwordNew"
            label="New password"
            name="passwordNew"
            type="password"
            :error="!!validation['passwordNew']"
            :error-messages="validation['passwordNew']"
            :required-mark="true"
          />
        </div>
        <div>
          <va-input
            v-model="data.ref.passwordNewRepeat"
            label="Repeat new password"
            name="passwordNewRepeat"
            type="password"
            :error="!!validation['passwordNewRepeat']"
            :error-messages="validation['passwordNewRepeat']"
            :required-mark="true"
          />
        </div>
      </div>
    </template>

    <template #actions="{ save, validate }">
      <div class="flex justify-center flex-col-reverse sm:flex-row mt-4 gap-2">
        <va-button @click="validate(true) && save('put')">Save</va-button>
      </div>
    </template>
  </owl-form>
</template>

<script setup lang="ts">
import { profileUserValidationSchema } from '@owl-app/lib-contracts';
import OwlForm from '@owl-app/lib-app-core/components/form/form.vue';
</script>
