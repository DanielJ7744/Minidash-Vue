<template>
  <nav aria-label="Progress">
    <ol role="list" class="flex items-center justify-center">
      <li
        v-for="(step, stepIdx) in steps"
        :key="step.name"
        :class="[
          stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-16' : '',
          'relative',
        ]"
      >
        <div
          class="absolute inset-0 flex items-center"
          aria-hidden="true"
        >
          <div
            class="h-0.5 w-full"
            :class="{
              'bg-primary': stepIdx + 1 < current,
              'bg-gray-200': stepIdx + 1 >= current,
            }"
          />
        </div>
        <a
          v-tooltip.top="step.name || undefined"
          class="relative text-sm flex items-center justify-center w-8 h-8 rounded-full"
          :class="{
            'bg-primary': stepIdx + 1 < current,
            'border-2 border-primary bg-white':
              stepIdx + 1 === current,
            'border-2 border-gray-200 bg-white': stepIdx + 1 > current,
            'cursor-default': stepIdx + 1 >= current,
          }"
          :aria-current="stepIdx + 1 === current ? 'step' : undefined"
          @click.prevent="
            () =>
              stepIdx + 1 < current && handleClick && handleClick(stepIdx, step)
          "
        >
          <span class="flex-shrink-0">
            <span
              class="flex items-center justify-center w-10 h-10 rounded-full"
            >
              <span
                :class="{
                  'text-white': stepIdx + 1 < current,
                  'text-primary': stepIdx + 1 === current,
                  'text-gray-300': stepIdx + 1 > current,
                }"
              >
                <slot :idx="stepIdx" :step="step">
                  {{ stepIdx + 1 }}
                </slot>
              </span>
            </span>
          </span>
        </a>
      </li>
    </ol>
  </nav>
</template>

<script>
export default {
  name: 'FormSteps',
  props: {
    current: {
      type: Number,
      required: false,
      default: 1,
    },
    steps: {
      type: Array,
      required: true,
    },
    handleClick: {
      type: Function,
      required: false,
      default: null,
    },
  },
};
</script>
