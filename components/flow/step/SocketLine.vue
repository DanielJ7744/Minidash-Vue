<template>
  <AsyncLeaderLine v-bind="$attrs" :key="key" />
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { v4 as uuid } from 'uuid';

import { flowStepSocketLineBus } from '@/lib/keys';

const AsyncLeaderLine = defineAsyncComponent(
  () => import('@/components/SVG/LeaderLine.client.vue')
);

const key = shallowRef(uuid());

useEventBus(flowStepSocketLineBus).on(() => {
  key.value = uuid();
});
</script>
