<template>
  <div class="text-center">
    <Icon name="la:plus-square" size="2.5rem" class="text-gray-400" />

    <h3 class="mt-2 text-sm font-medium text-gray-900">
      <slot></slot>
    </h3>
    <p class="mt-1 text-sm text-gray-500" v-if="!!$slots.info">
      <slot name="info"></slot>
    </p>
    <div class="mt-6" v-if="!!$slots.button">
      <slot name="button"></slot>
    </div>
  </div>
</template>
