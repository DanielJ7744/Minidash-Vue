<template>
  <div
    class="flex-1"
    :class="{
      'mt-14': !isTriggerStep,
    }"
  >
    <FlowStepAddButton
      v-if="step && !isTriggerStep"
      :step="step"
      class="mb-4"
      position="above"
    />

    <div class="relative">
      <template v-if="step && !isTriggerStep">
        <FlowStepSocket :step="step" position="top" />
      </template>

      <div
        :class="shadowClass"
        class="mx-auto w-80 rounded-lg text-left shadow-md"
      >
        <div
          :class="containerClass"
          class="overflow-hidden rounded-lg border bg-white"
        >
          <div class="flex justify-between px-3 py-1" :class="headerClass">
            <div class="flex items-center space-x-1" :class="titleClass">
              <Icon :name="icon" size="1.2em" />

              <h3 class="text-xs font-medium leading-6">
                <slot name="title"> Empty step </slot>
              </h3>
            </div>
            <div :class="titleClass">
              <button
                v-if="!!$slots.sidebar"
                v-tooltip.top="`Settings`"
                @click.prevent="showSidebar = true"
              >
                <Icon name="la:cog" size="1.2em" />

                <span class="sr-only">Settings</span>
              </button>
            </div>
          </div>
          <div
            class="bg-white px-4 py-3 sm:flex sm:items-start sm:justify-between"
          >
            <slot name="content">No content</slot>
          </div>
        </div>
      </div>

      <FlowStepSocket v-if="step" :step="step" position="bottom" />
    </div>

    <FlowStepAddButton
      class="mt-2"
      v-if="step && !step.children?.length"
      :step="step"
      position="below"
    />

    <slot name="sidebar" v-if="!!$slots.sidebar && showSidebar" />

    <FlowStepRow v-if="step?.children?.length" :steps="step.children" />

    <template v-if="step">
      <FlowStepSocketLine
        v-for="childStep in step.children"
        :key="childStep.id"
        :startElementSelector="`[data-plug-out=plug-${step.id}-${childStep.id}]`"
        :endElementSelector="`[data-plug-in=plug-${childStep.id}]`"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { flowStepSidebarKey } from '@/lib/keys';

import type { FlowStep } from '@/types/core/v1';

const props = withDefaults(
  defineProps<{
    step?: FlowStep;
    icon?: string;
    containerClass?: string;
    headerClass?: string;
    titleClass?: string;
    shadowClass?: string;
  }>(),
  {
    icon: 'la:rocket',
    containerClass: 'border-gray-400 hover:border-gray-600',
    headerClass: 'bg-gray-50',
    titleClass: 'text-gray-500',
    shadowClass: 'text-gray-100',
  }
);

const showSidebar = shallowRef(false);
const isTriggerStep = shallowRef(props.step?.type === 'trigger' || false);

provide(flowStepSidebarKey, {
  renderSidebar: showSidebar,
  updateRenderSidebar: (b: boolean) => (showSidebar.value = b),
});
</script>
