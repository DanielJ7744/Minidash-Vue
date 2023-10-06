<template>
  <img
    :src="'/images/icons/' + iconName + '.svg'"
    :alt="iconName"
    :title="iconName"
  />
</template>

<script>
export default {
  name: 'SideMenuIcon',
  props: {
    iconName: {
      type: String,
      required: true,
      default: null,
    },
  },
};
</script>
