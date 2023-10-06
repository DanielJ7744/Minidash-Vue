<template>
  <div class="relative h-full">
    <div
      id="flow-canvas-container"
      ref="canvasContainer"
      class="h-full overflow-auto"
    >
      <div class="relative h-full">
        <div>
          <div class="absolute min-w-full p-12" id="flow-canvas" ref="canvas">
            <FlowStepRow :steps="[nestedFlowSteps[0]]" class="min-w-[100vw]" />
          </div>
        </div>
      </div>

      <div class="absolute top-2 left-2 sm:top-3 sm:left-3">
        <UiCard class="px-2 py-2" wide>
          <div class="flex items-center space-x-3 divide-x">
            <div>
              <img src="/images/pw.svg" alt="Patchworks" class="h-7" />
            </div>
            <div class="px-2">
              <h6 class="text-sm font-medium tracking-wide text-gray-700">
                Flow #39320
              </h6>
            </div>
          </div>
        </UiCard>
      </div>

      <div class="absolute top-16 left-2 sm:top-16 sm:left-3">
        <UiCard class="px-2 py-2" wide>
          <div class="flex flex-col items-center space-y-2 text-gray-800">
            <div>
              <button class="hover:text-primary p-1">
                <Icon name="la:cog" size="1.5em" />
              </button>
            </div>
            <div>
              <button
                class="hover:text-primary p-1"
                @click.prevent="() => scrollToTrigger()"
              >
                <Icon name="carbon:center-circle" size="1.5em" />
              </button>
            </div>
            <div>
              <button class="hover:text-primary p-1">
                <Icon name="la:sign-out-alt" size="1.5em" />
              </button>
            </div>
          </div>
        </UiCard>
      </div>
    </div>

    <div v-if="!ready" class="absolute inset-0 bg-white">
      <UiLoading />
    </div>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuid } from 'uuid';
import { nestFlowSteps } from '@/lib/flows';
import { flowStepSocketLineBus } from '@/lib/keys';

import type { Flow, FlowStep } from '@/types/core/v1';

const lineBus = useEventBus(flowStepSocketLineBus);

const { flow } = defineProps<{
  flow: Flow;
}>();

const canvas = shallowRef<HTMLElement | null>(null);
const canvasContainer = shallowRef<HTMLElement | null>(null);
const ready = shallowRef(false);
const workingFlow = ref(flow);
const nestedFlowSteps = computed(() => nestFlowSteps(workingFlow.value.steps));

watch(
  () => workingFlow.value.steps.length,
  () => lineBus.emit()
);

useEventBus('canvas.steps.create').on(
  (
    event,
    payload: {
      position: 'above' | 'below';
      stepId: FlowStep['id'];
      stepParentId: FlowStep['parent_id'];
    }
  ) => {
    // TODO: temporary hack for demo
    const stepTypes = ['map', 'filter'] as FlowStep['type'][];

    const newStep: FlowStep = {
      id: uuid(),
      type: stepTypes[Math.floor(Math.random() * stepTypes.length)],
    };

    newStep.parent_id =
      payload.position === 'above' ? payload.stepParentId : payload.stepId;

    if (payload.position === 'above') {
      workingFlow.value.steps = workingFlow.value.steps.map((step) => ({
        ...step,
        parent_id: step.id === payload.stepId ? newStep.id : step.parent_id,
      }));
    }

    workingFlow.value.steps.push(newStep);
  }
);

const scrollToTrigger = (smooth = true) => {
  if (!canvasContainer.value || !canvas.value) {
    return;
  }

  const canvasCenter = canvas.value.clientWidth / 2;
  const canvasContainerCenter = canvasContainer.value.clientWidth / 2;

  canvasContainer.value.scrollTo({
    top: 0,
    left: canvasCenter - canvasContainerCenter,
    behavior: smooth ? 'smooth' : 'auto',
  });
};

onMounted(() => {
  setTimeout(() => {
    scrollToTrigger(false);

    ready.value = true;
  }, 500);
});
</script>

<style>
.leader-line {
  z-index: -1;

  /* TODO */
  stroke-linecap: round;
}
.socket-plug {
  @apply flex h-4 w-4 items-center justify-center rounded-full border border-gray-500 bg-white;
}
</style>
