<template>
  <div class="flex items-center justify-between p-2 gap-x-2">
    <div>
      <div class="font-semi-bold text-gray-900 text-sm">
        {{ toggleHeader }}
      </div>
      <div v-if="toggleDescription" class="text-xs">
        {{ toggleDescription }}
      </div>
    </div>
    <div>
      <FormToggle v-model="inputValue" :disable-toggle="disableToggle" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'LabelledToggle',
  props: {
    modelValue: {
      type: [Number, Boolean],
      required: false,
      default: false,
    },
    toggleHeader: {
      type: String,
      required: true,
    },
    toggleDescription: {
      type: String,
      required: false,
      default: null,
    },
    disableToggle: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    inputValue: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
  },
};
</script>
