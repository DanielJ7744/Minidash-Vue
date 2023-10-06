<template>
  <div
    class="flex flex-col items-center h-full gap-1 progress-bar__vertical"
  >
    <div class="flex items-center justify-between text-xs">
      <span>{{ label }}</span>
    </div>
    <div
      class="flex-grow h-1 mt-2 rotate-180 bg-gray-200 rounded"
      :style="{ width: barWidth + 'px' }"
    >
      <div
        class="w-full h-1 rounded bg-primary"
        :style="{ height: progressPercent }"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBarVertical',
  components: {},
  props: {
    label: {
      type: String,
      required: false,
      default: '',
    },
    total: {
      type: Number,
      required: false,
      default: 999,
    },
    progress: {
      type: Number,
      required: false,
      default: 0,
    },
    barWidth: {
      type: Number,
      required: false,
      default: 8,
    },
  },
  data() {
    return {};
  },
  computed: {
    progressPercent() {
      let progress = Math.round((this.progress / this.total) * 100);

      if (progress > 100) {
        progress = 100;
      }

      return progress + '%';
    },
  },
  methods: {},
};
</script>
