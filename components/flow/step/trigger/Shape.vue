<template>
  <FlowStepBase
    :step="step"
    :icon="flowShapeMeta.trigger.icon"
    container-class="border-purple-300 hover:border-purple-500"
    header-class="bg-purple-50"
    title-class="text-purple-700"
    shadow-class="shadow-purple-100"
  >
    <template #title>Trigger</template>

    <template #content>
      <div>
        <div class="mt-1 text-sm text-gray-500 sm:flex sm:items-center">
          <div><p class="text-xs">Schedule</p></div>
        </div>
        <div class="text-sm font-medium text-gray-700">Every 15 minutes</div>
      </div>
    </template>

    <template #sidebar>
      <FlowStepTriggerSettings />
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
