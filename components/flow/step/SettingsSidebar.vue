<template>
  <Sidebar
    v-model:visible="open"
    position="right"
    @afterHide="updateRenderSidebar(false)"
  >
    <template #header>
      <div class="flex items-center space-x-1" :class="textClass">
        <slot name="header" />
      </div>
    </template>

    <slot name="default">
      <p>-</p>
    </slot>
  </Sidebar>
</template>

<script setup lang="ts">
import { flowStepSidebarKey } from '@/lib/keys';

withDefaults(
  defineProps<{
    textClass?: string;
  }>(),
  {
    textClass: 'text-gray-700',
  }
);

const open = shallowRef(false);

const { renderSidebar, updateRenderSidebar } = inject(flowStepSidebarKey, {
  renderSidebar: shallowRef(false),
  updateRenderSidebar: () => {},
});

watchEffect(() => {
  if (renderSidebar) {
    open.value = true;
  }
});
</script>
