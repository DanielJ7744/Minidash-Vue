<template>
  <FlowStepBase
    :step="step"
    :icon="flowShapeMeta.filter.icon"
    container-class="border-orange-300 hover:border-orange-500"
    header-class="bg-orange-50"
    title-class="text-orange-700"
    shadow-class="shadow-orange-100"
  >
    <template #title>Filter</template>

    <template #content>
      <div>
        <div class="text-sm font-medium text-gray-700">6 filters</div>
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
