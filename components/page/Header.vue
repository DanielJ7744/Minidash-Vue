<template>
  <div
    class="sm:flex justify-between mb-6 w-full space-y-5 sm:space-y-0 sm:space-x-10"
  >
    <div class="flex-1">
      <h1 class="h3">
        <slot name="title" />
      </h1>
      <div
        v-if="$slots.description"
        class="mt-1 text-gray-500 text-sm"
      >
        <slot name="description" />
      </div>
    </div>
    <div v-if="$slots.actions">
      <slot name="actions" />
    </div>
  </div>
</template>
