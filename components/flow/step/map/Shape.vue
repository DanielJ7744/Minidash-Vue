<template>
  <FlowStepBase
    :step="step"
    :icon="flowShapeMeta.map.icon"
    container-class="border-yellow-300 hover:border-yellow-500"
    header-class="bg-yellow-50"
    title-class="text-yellow-600"
    shadow-class="shadow-yellow-100"
  >
    <template #title>Map</template>

    <template #content>
      <div>
        <div class="text-sm font-medium text-gray-700">
          21 fields, 8 transformations
        </div>
      </div>
    </template>
  </FlowStepBase>
</template>

<script setup lang="ts">
import { flowShapeMeta } from '@/types/core/v1';
import type { FlowStep } from '@/types/core/v1';

defineProps<{
  step: FlowStep;
}>();
</script>
