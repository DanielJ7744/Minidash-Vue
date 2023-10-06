<template>
  <div
    :class="[
      'bg-white flex items-center justify-center border rounded w-7 aspect-square',
      status
        ? 'border-green-500'
        : 'border-gray-600'
    ]"
  >
    <span v-if="status" class="text-green-500 icon icon--circle-down" />
    <!-- Heroicon name: outline/pause -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 text-gray-600 aspect-square"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'ServiceStatusIcon',
  props: {
    status: {
      type: [Boolean, Number],
      required: true
    }
  }
}
</script>
