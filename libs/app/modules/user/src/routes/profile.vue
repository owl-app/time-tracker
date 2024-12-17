<template>
  <panel-layout>
    <div class="flex w-full justify-center">
      <div class="w-3/6">
        <va-card>
          <va-card-title class="text-3xl"> Profile </va-card-title>
          <va-divider />
          <va-card-content>
            <profile-form />
          </va-card-content>
        </va-card>
      </div>
    </div>
  </panel-layout>
</template>

<script setup lang="ts">
import ProfileForm from '../components/profile-form.vue';
</script>

<style lang="scss" scoped>
:deep() {
  .va-card {
    &__title {
      font-size: 1.2rem;
    }
  }
}
</style>
