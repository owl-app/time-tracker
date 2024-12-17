<template>
  <img src="../assets/logo-cropped.webp" alt="Owl" class="owl-logo" />
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    height?: number;
    start?: string;
    end?: string;
  }>(),
  {
    height: 18,
    start: 'primary',
    end: undefined,
  }
);
</script>
