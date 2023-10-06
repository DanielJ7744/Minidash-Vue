<template>
  <div
    v-if="errors.length > 0"
    class="message-group"
  >
    <div
      v-for="(error, index) in errors"
      :key="index"
      class="message message--fail message--min-padding"
    >
      {{ error }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorList',
  props: {
    errors: {
      type: Array,
      required: true
    }
  }
};
</script>
