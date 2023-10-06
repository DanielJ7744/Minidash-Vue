<template>
  <LazyFlowCanvas v-if="!pending && flow" :flow="flow" />

  <div class="absolute top-3 right-3 mx-3 flex flex-col space-y-1">
    <button
      v-for="current in ['simple', 'intermediate', 'advanced']"
      class="button capitalize shadow-lg"
      :class="[complexity === current ? 'button-primary' : 'button-secondary']"
      @click="complexity = current"
    >
      {{ current }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Flow } from '@/types/core/v1';

definePageMeta({
  title: 'Flow',
  wide: true,
  role: 'developer',
});

const complexity = ref('simple');

const { data: flow, pending } = await useAsyncData(
  () =>
    $fetch<{ data: Flow }>('/api/sample-flows', {
      query: { complexity: complexity.value },
    }),
  { transform: (r) => r.data, watch: [complexity] }
);
</script>
