<template>
  <div
    class="grid grid-cols-7 border border-gray-400 rounded-md"
    :class="{ 'border-danger-600': valuesSwapped }"
  >
    <div class="col-span-3">
      <input
        v-model="editableLeftValue"
        type="text"
        :disabled="!allowEditing"
        class="w-full border-none bg-transparent"
        placeholder="Enter the value to be converted to the one on the right"
        @change="leftValueChanged()"
      />
    </div>
    <div class="flex items-center justify-center text-lg">
      <div class="icon icon--arrow-right" />
    </div>
    <div class="col-span-3 flex items-center justify-between">
      <div :class="{ 'w-full': !allowEditing, 'w-11/12': allowEditing }">
        <input
          v-model="editableRightValue"
          type="text"
          :disabled="!allowEditing"
          class="w-full border-none bg-transparent"
          placeholder="Enter the value for the one on the left to be converted to"
          @change="rightValueChanged()"
        />
      </div>
      <div
        v-if="allowEditing"
        class="w-12 text-center text-lg border-l border-gray-400 cursor-pointer icon icon--close-no-circle"
        @click="$emit('removeMapValue')"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'TransformMapValueEditor',
  props: {
    leftValue: {
      type: String,
      required: false,
      default: '',
    },
    rightValue: {
      type: String,
      required: false,
      default: '',
    },
    allowEditing: {
      type: Boolean,
      required: true,
    },
    valuesSwapped: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      editableLeftValue: this.leftValue,
      editableRightValue: this.rightValue,
    };
  },
  methods: {
    leftValueChanged() {
      this.$emit('leftValueChanged', this.editableLeftValue);
    },
    rightValueChanged() {
      this.$emit('rightValueChanged', this.editableRightValue);
    },
  },
};
</script>
