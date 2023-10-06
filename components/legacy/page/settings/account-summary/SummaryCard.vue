<template>
  <div class="flex-grow px-5 py-4 card md:mb-0">
    <div class="flex items-center justify-between mb-5">
      <h3 class="text-sm font-medium">
        {{ title }}
      </h3>
      <NuxtLink slot="bottom" :to="link">
        <p class="text-sm text-gray-800 underline">
          {{ linkText }}
        </p>
      </NuxtLink>
    </div>
    <ProgressBar
      :total="total"
      :progress="progress"
      bar-type="secondary"
      :subscription="subscription"
    />
  </div>
</template>

<script>
export default {
  name: 'SummaryCard',
  props: {
    title: {
      type: String,
      required: true,
    },
    linkText: {
      type: String,
      default: '',
    },
    link: {
      type: String,
      default: '',
    },
    total: {
      type: Number,
      default: 999,
    },
    progress: {
      type: Number,
      default: 0,
    },
    subscription: {
      type: String,
      required: false,
      default: '',
    },
  },
};
</script>
