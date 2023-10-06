<template>
  <span v-tooltip.top="message" class="icon icon--info" />
</template>

<script>
export default {
  name: 'ToolTip',
  props: {
    message: {
      type: String,
      required: true,
    },
  },
};
</script>
