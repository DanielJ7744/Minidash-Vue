<template>
  <ul role="list" class="-mb-8">
    <li v-for="(entry, idx) in entries" :key="idx">
      <div class="relative pb-3 group">
        <span v-if="idx !== entries.length - 1" class="absolute top-3 left-1.5 -ml-px h-full w-0.5 bg-gray-300" aria-hidden="true" />
        <div class="relative flex space-x-3">
          <div class="pt-2">
            <span class="mt-1 h-3 w-3 rounded-full bg-gray-300 group-hover:bg-primary flex items-center justify-center ring-2 ring-gray-300" />
          </div>
          <slot :entry="entry" />
        </div>
      </div>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'Timeline',
  props: {
    entries: {
      type: Array,
      required: false,
      default: () => []
    }
  }
}
</script>
