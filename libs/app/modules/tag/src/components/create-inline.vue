<template>
  <owl-form collection="tags" @saved="$emit('saved', $event)" class-form="grid grid-cols-12 gap-4">
    <template #fields="{ data }">
      <div class="col-span-10">
        <va-input label="" placeholder="Add new tag" v-model="data.ref.name" background="#fff" />
      </div>
    </template>

    <template #actions="{ save, data }">
      <div class="flex justify-end flex-col-reverse sm:flex-row col-span-2">
        <va-button :disabled="isEmpty(data.ref.name)" @click="!isEmpty(data.ref.name) && save()"
          >Add</va-button
        >
      </div>
    </template>
  </owl-form>
</template>

<script setup lang="ts">
import OwlForm from '@owl-app/lib-app-core/components/form/form.vue';
import { Tag } from '@owl-app/lib-contracts';
import { isEmpty } from '@owl-app/utils';

defineEmits<{
  (event: 'saved', tagSaved: Tag): void;
}>();
</script>

<style lang="scss" scoped>
:deep() {
  .va-message-list {
    display: none;
  }
}
</style>
