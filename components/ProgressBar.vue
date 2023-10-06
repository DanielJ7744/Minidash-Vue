<template>
  <div class="progress-bar">
    <div class="flex items-center justify-between text-xs">
      <span :class="{ 'hidden': barType === 'secondary' }">
        {{ label }}
      </span>
      <span
        v-if="subscription === 'Base'"
        class="font-normal"
        :class="{
          'text-2xl font-medium text-main-800':
            barType === 'secondary',
        }"
      >
        {{ $filters.abbreviateUnit(progress) }}
      </span>
      <span
        v-else
        class="font-normal"
        :class="{
          'text-2xl font-medium text-main-800':
            barType === 'secondary',
        }"
      >
        {{
          $filters.abbreviateUnit(progress) +
          '/' +
          $filters.abbreviateUnit(total)
        }}
      </span>
    </div>
    <div class="h-1 mt-2 bg-gray-200 rounded">
      <div
        class="h-1 rounded bg-primary"
        :style="{ width: progressPercent }"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',
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
      default: 0,
    },
    progress: {
      type: Number,
      required: false,
      default: 0,
    },
    barType: {
      type: String,
      required: false,
      default: 'primary',
    },
    subscription: {
      type: String,
      required: false,
      default: '',
    },
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
};
</script>
