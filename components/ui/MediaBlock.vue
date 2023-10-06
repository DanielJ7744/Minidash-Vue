<template>
  <div class="flex items-center mb-4 mt-2">
    <div v-if="backgroundImage" class="bg-contain inline-block bg-center bg-no-repeat mr-4" :style="`background-image: url(${backgroundImage})`">
      <img
        v-if="image"
        class="w-10 rounded"
        :src="image"
        alt="Media image"
      >
    </div>
    <img
      v-else-if="image"
      class="w-10 mr-4 rounded"
      :src="image"
      alt="Media image"
    >
    <div>
      <p v-if="inverted" class="text-gray-700 mb-0" :class="{ 'text-lg': !smallText, 'text-sm': smallText }">
        <slot />
      </p>
      <h3 class="mb-0" :class="{ 'text-xl': !smallText, 'text-base': smallText }">
        {{ title }}
      </h3>
      <p v-if="!inverted" class="text-gray-700 mb-0" :class="{ 'text-lg': !smallText, 'text-sm': smallText }">
        <slot />
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MediaBlock',
  props: {
    title: {
      type: String,
      required: true,
      default: null
    },
    image: {
      type: String,
      required: false,
      default: null
    },
    inverted: {
      type: Boolean,
      required: false,
      default: false
    },
    smallText: {
      type: Boolean,
      required: false,
      default: false
    },
    backgroundImage: {
      type: String,
      required: false,
      default: null
    }
  }
}
</script>
