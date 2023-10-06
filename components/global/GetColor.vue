<template>
  <img
    :ref="imageRef"
    :src="credentialImage"
    :alt="imageAlt"
    @error="handleError"
  />
</template>

<script>
import { FastAverageColor } from 'fast-average-color';

export default {
  name: 'GetColor',
  props: {
    imageRef: {
      type: String,
      required: false,
      default: '',
    },
    imageSrc: {
      type: String,
      required: false,
      default: '',
    },
    imageAlt: {
      type: String,
      required: false,
      default: '',
    },
  },
  data: () => ({
    color: {
      hex: '',
      dark: false,
    },
    error: false,
  }),
  computed: {
    credentialImage() {
      return getSystemLogo(this.imageSrc);
    },
  },
  async mounted() {
    // TODO: create a single instance elsewhere and re-use with a composable
    const fac = new FastAverageColor();

    try {
      this.color = await fac.getColorAsync(this.$refs.logo, {
        algorithm: 'dominant',
      });
      this.$emit('colorValue', this.color.hex);
    } catch (e) {
      this.handleError(e);
    }
    this.$emit('imageLoaded');
  },
  methods: {
    handleError(e) {
      this.error = true;
    },
  },
};
</script>
