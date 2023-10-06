<template>
  <form
    class="flex h-full flex-col overflow-hidden"
    @submit.prevent="emit('submit')"
  >
    <!-- Content -->
    <div class="flex-1 space-y-4 divide-y overflow-y-auto">
      <slot section-class="space-y-10 px-4 pt-4" />
    </div>

    <!-- Footer -->
    <template v-if="!!$slots.footer">
      <div
        class="flex h-14 shrink-0 items-center justify-between border-t px-4 py-4"
      >
        <slot name="footer" />
      </div>
    </template>
  </form>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'submit'): void;
}>();
</script>
