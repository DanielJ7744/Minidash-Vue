<template>
  <div class="space-y-4 py-5 lg:flex lg:space-y-0 lg:space-x-8">
    <div class="mb-6 shrink-0 md:mb-0 lg:w-1/3">
      <div>
        <h6 class="h5 md:h6 mb-2">
          {{ title }}
        </h6>
      </div>
      <div class="text-sm text-gray-500" v-if="!!$slots.info">
        <slot name="info" />
      </div>
    </div>

    <div class="flex-1" :class="{ 'overflow-x-hidden': !!$slots.content }">
      <template v-if="!!$slots.content">
        <div v-if="loading" class="relative h-32">
          <UiLoading />
        </div>
        <div v-else class="space-y-4 overflow-x-hidden">
          <slot name="content" />
        </div>
      </template>

      <UiCard v-else>
        <div v-if="loading" class="relative h-32">
          <UiLoading />
        </div>
        <div v-else class="space-y-4">
          <slot />
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TitledCard',
  props: {
    title: {
      type: String,
      required: false,
      default: null,
    },
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
};
</script>
