<template>
  <span
    class="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium transition-all duration-200"
    :class="{
      'bg-gray-200 text-gray-800': severity === 'info',
      'bg-success-100 text-success-800': severity === 'success',
      'bg-amber-100 text-amber-800': severity === 'warning',
      'bg-danger-100 text-danger-800': severity === 'danger',
    }"
  >
    <template v-if="loading">
      <svg
        class="animate-spin w-2 h-2 my-1"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </template>

    <template v-else>
      <slot v-if="orientation === 'left'"></slot>
      <span
        v-if="dot"
        class="relative flex h-2 w-2"
        :class="[orientation === 'left' ? 'ml-1.5' : 'mr-1.5']"
      >
        <span
          class="absolute inline-flex h-full w-full rounded-full opacity-75 transition-all duration-200"
          :class="[
            {
              'animate-ping': pulse,
              'bg-gray-400': severity === 'info',
              'bg-success-400': severity === 'success',
              'bg-amber-400': severity === 'warning',
              'bg-danger-400': severity === 'danger',
            },
          ]"
        />
        <span
          class="relative inline-flex rounded-full h-2 w-2 transition-all duration-200"
          :class="[
            {
              'bg-gray-500': severity === 'info',
              'bg-success-500': severity === 'success',
              'bg-amber-500': severity === 'warning',
              'bg-danger-500': severity === 'danger',
            },
          ]"
        />
      </span>
      <slot v-if="orientation === 'right'" />
    </template>
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    severity?: 'info' | 'success' | 'warning' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    orientation?: 'left' | 'right';
    loading?: boolean;
    dot?: boolean;
    pulse?: boolean;
  }>(),
  {
    severity: 'info',
    size: 'md',
    orientation: 'left',
    loading: false,
    dot: false,
    pulse: false,
  }
);
</script>
