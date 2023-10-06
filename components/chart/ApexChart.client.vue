<template>
  <div class="relative mt-10">
    <h4 class="h5 font-normal">
      <slot name="title" />
    </h4>

    <div :class="{ 'opacity-30': loading }">
      <apexchart
        v-bind="{
          type: $attrs.type,
          options: $attrs.options,
          height: $attrs.height,
          width: $attrs.width,
          series: $attrs.series,
        }"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApexChart',
  inheritAttrs: false,
};
</script>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>
