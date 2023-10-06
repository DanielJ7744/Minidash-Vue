<template>
  <div>
      <div
        ref="container"
        class="relative flex items-center justify-center w-16 h-16 rounded-l-md p-3"
      >
        <UiLoading v-if="!loaded" />
        <div
          v-show="loaded"
          class="flex aspect-square h-full items-center justify-center rounded border border-solid object-contain p-1"
          :class="[borderStyleLight ? 'border-white' : 'border-gray-500']"
        >
          <GetColor
            image-ref="logo"
            :image-src="iconName"
            :image-alt="iconName"
            @colorValue="setBackgroundColour"
            @imageLoaded="imageLoaded"
          />
        </div>
      </div>
  </div>
</template>

<script>
export default {
  name: 'ImageIcon',
  props: {
    icon: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    loaded: false,
    borderStyleLight: true,
  }),
  computed: {
    iconName() {
      return this.icon
    },
  },
  methods: {
    imageLoaded() {
      this.loaded = true;
    },
    setBackgroundColour(color) {
      if (color === '#ffffff') {
        this.borderStyleLight = false;
      }
      this.$refs.container.style.backgroundColor = color;
    },
  },
};
</script>
