<template>
  <ButtonBase v-bind="{ ...$props, ...$attrs }">
    <slot />
    <!-- Heroicon name: solid/chevron-down -->
    <svg
      class="w-5 h-5 ml-2 -mr-1 text-gray-400 duration-300 ease-out transform-all"
      :class="{
        '-rotate-180': open,
      }"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="false"
    >
      <path
        fill-rule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clip-rule="evenodd"
      />
    </svg>
  </ButtonBase>
</template>

<script>
export default {
  name: 'DropdownButton',
  props: {
    open: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
};
</script>
