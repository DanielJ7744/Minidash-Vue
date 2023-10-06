<template>
  <div class="whitespace-nowrap">
    <span class="capitalize">
      {{ selectedValueFormatted }}
    </span>
    <button
      :class="[
        'button button--understated button--small button--icon',
        `button--icon-${iconForSelectedValue}`,
      ]"
      @click.prevent="selectNextOption()"
    />
  </div>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'MapDirectionSelect',

  props: {
    optionDefinition: {
      required: true,
      type: Object,
    },
    modelValue: {
      type: [String, Number, Boolean, Array],
      required: true,
      default: null,
    },
  },

  computed: {
    data: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
        this.setChildHasUnsavedChanges(true);
      },
    },

    valueHasBeenSet() {
      return !(this.data === null || this.data === undefined);
    },

    allowedValues() {
      return this.optionDefinition.allowed_values ?? null;
    },

    selectedValueFormatted() {
      return this.data.replaceAll('-', ' ');
    },

    iconForSelectedValue() {
      switch (this.data) {
        case 'left-to-right':
          return 'arrow-right';
        case 'right-to-left':
          return 'arrow-left';
        default:
          return '';
      }
    },
  },
  mounted() {
    if (!this.valueHasBeenSet) {
      this.data = this.optionDefinition.default ?? null;
    }
  },
  methods: {
    ...mapActions(useMappingTransformationsStore, [
      'setChildHasUnsavedChanges',
    ]),
    selectNextOption() {
      const currentIndex = this.allowedValues.indexOf(this.data);
      const optionCount = this.allowedValues.length;
      const nextIndex = currentIndex + 1 < optionCount ? currentIndex + 1 : 0;
      this.data = this.allowedValues[nextIndex];
    },
  },
};
</script>
