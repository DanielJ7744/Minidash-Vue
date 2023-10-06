<template>
  <div class="absolute flex items-center justify-center w-full h-full text-center">
    <div>
      <div class="flex items-center justify-center space-x-2">
        <span class="text-lg icon icon--alert" />
        <p class="text-lg text-medium">
          {{ title }}
        </p>
      </div>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Error',
  props: {
    title: {
      type: String,
      required: false,
      default: 'An error occurred'
    },
    message: {
      type: String,
      required: false,
      default: 'Please try again'
    }
  }
}
</script>
