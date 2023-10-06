<template>
  <button
    type="button"
    :class="[buttonEnabledClass, toggleEnabledClass]"
    class="relative inline-flex flex-shrink-0 h-6 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full w-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    role="switch"
    aria-checked="false"
    :disabled="disableToggle"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span class="sr-only">Use setting</span>
    <span
      aria-hidden="true"
      :class="[modelValue ? 'translate-x-5' : 'translate-x-0']"
      class="inline-block w-5 h-5 transition duration-200 ease-in-out transform bg-white rounded-full shadow pointer-events-none ring-0"
    />
  </button>
</template>

<script>
export default {
  name: 'Toggle',
  props: {
    modelValue: {
      type: [Number, Boolean],
      required: true,
    },
    disableToggle: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    buttonEnabledClass() {
      return this.modelValue ? 'bg-primary' : 'bg-gray-200';
    },
    toggleEnabledClass() {
      return this.disableToggle ? 'cursor-not-allowed' : 'cursor-pointer';
    },
  },
};
</script>
