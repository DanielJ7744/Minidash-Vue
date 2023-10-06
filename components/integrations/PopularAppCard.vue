<template>
  <div
    class="border border-gray-100 shadow-md rounded overflow-hidden"
  >
    <div ref="container" class="p-4">
      <div
        class="object-contain w-24 p-3 m-auto border border-solid rounded aspect-square"
        :class="[borderStyleLight ? 'border-white' : 'border-gray-500']"
      >
        <GetColor
          image-ref="logo"
          :image-src="system.name"
          :image-alt="system.name"
          @colorValue="setBackgroundColour"
        />
      </div>
    </div>
    <div class="flex justify-between px-4 py-4 items-center">
      <div>
        <h6 class="h6">
          {{ system.name }}
        </h6>
        <p>{{ system.systemType ? system.systemType.description : '' }}</p>
      </div>
      <div class="content--flex-end">
        <button
          class="button button-secondary button-lg"
          @click="$emit('click', system)"
        >
          Use
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PopularAppCard',
  props: {
    system: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    borderStyleLight: true,
  }),
  methods: {
    setBackgroundColour(color) {
      if (color === '#ffffff') {
        this.borderStyleLight = false;
      }
      this.$refs.container.style.backgroundColor = color;
    },
  },
};
</script>
