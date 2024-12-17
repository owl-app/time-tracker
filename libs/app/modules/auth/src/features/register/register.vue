<template>
  <auth-layout>
    <div class="w-96">
      <div class="text-right">
        <RouterLink :to="{ name: 'login' }" class="font-semibold text-primary"
          >Back to sign in</RouterLink
        >
      </div>
      <h1 class="font-semibold text-4xl mb-4">Sign up</h1>
      <p class="text-base mb-4 leading-5">Start your journey with Owl and tracking time</p>
      <owl-form
        collection="auth/register"
        :schema="registerUserValidationSchema"
        @saved="$emit('registered')"
      >
        <template #fields="{ data, validation }">
          <va-input
            v-model="data.ref.email"
            label="E-mail"
            name="email"
            class="mb-4"
            type="email"
            :error="!!validation['email']"
            :error-messages="validation['email']"
            :required-mark="true"
          />
          <va-input
            v-model="data.ref.passwordNew"
            label="New password"
            name="passwordNew"
            type="password"
            class="mb-4"
            :error="!!validation['passwordNew']"
            :error-messages="validation['passwordNew']"
            :required-mark="true"
          />
          <va-input
            v-model="data.ref.passwordNewRepeat"
            label="Repeat new password"
            name="passwordNewRepeat"
            type="password"
            class="mb-4"
            :error="!!validation['passwordNewRepeat']"
            :error-messages="validation['passwordNewRepeat']"
            :required-mark="true"
          />
        </template>

        <template #actions="{ validate, data }">
          <div class="flex justify-center mt-4">
            <va-button
              class="w-full"
              :loading="userStore.loading"
              @click="
                validate(true) &&
                  register(data.value.email, data.value.passwordNew, data.value.passwordNewRepeat)
              "
            >
              Start
            </va-button>
          </div>
        </template>
      </owl-form>
    </div>
  </auth-layout>
</template>

<script lang="ts" setup>
import { useToast } from 'vuestic-ui';
import { registerUserValidationSchema } from '@owl-app/lib-contracts';
import { useUserStore } from '@owl-app/lib-app-core/stores/user';
import { router } from '@owl-app/lib-app-core/application/router';
import OwlForm from '@owl-app/lib-app-core/components/form/form.vue';

const userStore = useUserStore();
const { init: notify } = useToast();

const register = async (email: string, passwordNew: string, passwordNewRepeat: string) => {
  try {
    await userStore.register(email, passwordNew, passwordNewRepeat);

    router.push({ path: 'login' });

    notify({
      message: 'You have been registered successfully',
      color: 'success',
      position: 'bottom-right',
      offsetY: 30,
    });
  } catch (error: any) {
    notify({
      message: error,
      color: 'danger',
      position: 'bottom-right',
      offsetY: 30,
    });
  }
};
</script>
