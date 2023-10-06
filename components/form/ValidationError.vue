<template>
  <div v-if="error">
    <p class="text-xs text-danger-600">
      {{ Array.isArray(error) ? error[0] : error }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'ValidationError',
  props: {
    error: {
      type: [String, Array],
      required: false,
      default: null
    }
  }
}
</script>
