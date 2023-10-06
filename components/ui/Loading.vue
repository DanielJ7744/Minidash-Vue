<template>
  <div v-if="label" class="flex items-center gap-3">
    <div>
      <UiSpinner class="relative w-auto" />
    </div>

    <div>
      <p class="text-sm">
        {{ label }}
      </p>
    </div>
  </div>
  <div class="absolute inset-0" v-else>
    <UiSpinner />
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    label: {
      type: String,
      required: false,
      default: undefined,
    },
  },
};
</script>
