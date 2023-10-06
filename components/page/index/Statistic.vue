<template>
  <div
    class="px-4 py-4 bg-white flex flex-col justify-between"
  >
    <div>
      <h5 class="text-sm font-medium">{{ title }}</h5>
    </div>
    <div class="h-12 flex flex-col-reverse">
      <div v-if="loading" class="relative w-5 my-3">
        <UiLoading class="gap-0" />
      </div>
      <h2
        v-else
        class="mt-1 text-xl font-medium"
        :style="{ color: colour }"
      >
        <template v-if="subscription === 'Base' || totalOnly">
          {{ $filters.abbreviateUnit(total) }}
        </template>
        <template v-else>
          {{ $filters.abbreviateUnit(progress) }}/{{
            $filters.abbreviateUnit(total)
          }}
        </template>
      </h2>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Statistic',
  props: {
    title: {
      type: String,
      required: true,
    },
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    total: {
      type: Number,
      default: 999,
    },
    progress: {
      type: Number,
      default: 0,
    },
    colour: {
      type: String,
      required: false,
      default: '#191919',
    },
    totalOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
    subscription: {
      type: String,
      required: false,
    },
  },
};
</script>
