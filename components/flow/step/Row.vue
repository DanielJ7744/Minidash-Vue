<template>
  <div class="relative flex space-x-8">
    <component
      :is="getComponent(step)"
      v-for="(step, idx) in steps"
      :step="step"
      :style="{ 'padding-top': getPadding(idx) }"
      :key="step.id"
    />
  </div>
</template>

<script setup lang="ts">
import type { FlowStep } from '@/types/core/v1';

const PADDING_TOP = 20;

const props = defineProps<{
  steps: FlowStep[];
}>();

const getComponent = (step: FlowStep) => {
  switch (step.type) {
    case 'map':
      return resolveComponent('FlowStepMapShape');
    case 'branch':
      return resolveComponent('FlowStepBranchShape');
    case 'filter':
      return resolveComponent('FlowStepFilterShape');
    case 'trigger':
      return resolveComponent('FlowStepTriggerShape');
    case 'connector':
      return resolveComponent('FlowStepConnectorShape');
    default:
      return resolveComponent('FlowStepEmptyShape');
  }
};

const getPadding = (idx: number): string => {
  const value =
    props.steps.length % 2 === 0
      ? getEvenPadding(idx, props.steps.length)
      : getOddPadding(idx, props.steps.length);

  return value + 'px';
};

const getEvenPadding = (idx: number, length: number): number => {
  const middleIndex = Math.floor(length / 2);
  const middle = [middleIndex, middleIndex - 1];

  return middle.every((middleIdx) => idx <= middleIdx)
    ? idx * PADDING_TOP
    : (length - (idx + 1)) * PADDING_TOP;
};

const getOddPadding = (idx: number, length: number): number => {
  const middleIndex = Math.floor(length / 2);

  return idx <= middleIndex
    ? idx * PADDING_TOP
    : (length - idx - 1) * PADDING_TOP;
};
</script>
