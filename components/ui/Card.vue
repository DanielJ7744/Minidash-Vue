<template>
  <div
    class="space-y-3 rounded-sm border border-gray-200 bg-white leading-5 shadow-lg"
  >
    <div v-if="title" class="border-b-2 border-gray-50 px-6 py-3">
      <h6 class="h6">
        {{ title }}
      </h6>
    </div>

    <div class="w-full" :class="{ 'px-4 py-4 md:px-6 md:py-5': !wide }">
      <slot />
    </div>

    <div v-if="!!$slots.footer" class="border-t-2 border-gray-50 py-3 md:px-6">
      <slot name="footer" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    wide: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: false,
      default: null,
    },
  },
};
</script>
