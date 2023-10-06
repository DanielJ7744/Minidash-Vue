<template>
  <div
    v-if="step"
    :class="{
      'top-0 -translate-y-1/2': position === 'top',
      'bottom-0 translate-y-1/2': position === 'bottom',
    }"
    class="absolute right-1/2 flex w-full max-w-xs translate-x-1/2 justify-around"
  >
    <template v-if="position === 'top'">
      <div :data-plug-in="`plug-${step.id}`" class="socket-plug">
        <Icon name="mdi:chevron-down" />
      </div>
    </template>
    <template v-else>
      <template v-for="childStep in step.children" :key="childStep.id">
        <div
          :data-plug-out="`plug-${step.id}-${childStep.id}`"
          class="socket-plug"
        >
          <Icon name="mdi:chevron-down" />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { FlowStep } from '@/types/core/v1';

defineProps<{
  position: 'top' | 'bottom';
  step: FlowStep;
}>();
</script>
