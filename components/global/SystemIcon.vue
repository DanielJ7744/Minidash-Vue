<template>
  <img
    class="aspect-square rounded-sm"
    :src="src"
    :alt="systemName"
    :title="systemName"
  />
</template>

<script>
export default {
  name: 'SystemIcon',
  props: {
    systemName: {
      type: String,
      required: false,
      default: null,
    },
  },
  data: () => ({
    src: null,
  }),
  created() {
    this.src = getSystemLogo(this.systemName);
  },
};
</script>
