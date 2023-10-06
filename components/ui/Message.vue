<template>
  <div
    class="rounded border border-2 p-4"
    :class="[
      { 'message--icon': showIcon, 'flex justify-center': centreMessage },
      `message--${type}`,
    ]"
  >
    <span v-if="showIcon" class="icon message__icon" :class="`icon--${icon}`" />

    <div class="grid grid-cols-1 gap-y-4">
      <div>
        <h3 v-if="header !== null" class="text-lg">
          {{ header }}
        </h3>
        <slot />
      </div>

      <slot name="buttons" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Message',
  props: {
    type: {
      type: String,
      required: false,
      default: 'info',
    },
    icon: {
      type: String,
      required: false,
      default: null,
    },
    header: {
      type: String,
      required: false,
      default: null,
    },
    buttonBarClass: {
      type: String,
      required: false,
      default: 'flex justify-center',
    },
    centreMessage: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    showIcon() {
      if (this.type === 'loading') {
        return false;
      }
      return this.icon !== null;
    },
  },
};
</script>
