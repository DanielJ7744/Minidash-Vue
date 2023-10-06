<template>
  <button
    @click.prevent="
      () =>
        canvasStepBus.emit('add', {
          stepId: step.id,
          stepParentId: step.parent_id,
          position,
        })
    "
    v-tooltip.top="`Add step`"
    class="mx-auto flex h-6 w-6 items-center justify-center rounded border-2 border-gray-200 bg-white/80 text-lg text-gray-400 transition-opacity hover:border-gray-300 hover:bg-gray-200 hover:text-gray-600 hover:shadow-md active:border-gray-300 active:bg-gray-300 active:text-white"
  >
    <Icon name="material-symbols:add-rounded" />
  </button>
</template>

<script setup lang="ts">
import type { FlowStep } from '@/types/core/v1';

defineProps<{
  step: FlowStep;
  position: 'above' | 'below';
}>();

// Add key to keys.ts
const canvasStepBus = useEventBus('canvas.steps.create');
</script>
