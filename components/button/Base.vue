<template>
  <button v-bind="{ ...$props, ...$attrs }" type="button">
    <slot />
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
};
</script>
