<template>
  <select
    v-if="isSelectInput"
    v-model="data"
    :required="optionDefinition.required"
    :class="{'form-item__input--is-default': !valueHasBeenSet}"
  >
    <option
      v-for="optionValue in allowedValues"
      :key="optionValue"
      :value="optionValue"
    >
      {{ optionValue }}
    </option>
  </select>

  <input
    v-else-if="isStringInput"
    v-model="data"
    :placeholder="optionDefinition.default"
    type="text"
    :required="optionDefinition.required"
    :class="{'form-item__input--is-default': !valueHasBeenSet}"
  >

  <input
    v-else-if="isNumberInput"
    v-model.number="data"
    :placeholder="optionDefinition.default"
    type="number"
    :step="numberInputStep"
    :required="optionDefinition.required"
    :class="{'form-item__input--is-default': !valueHasBeenSet}"
  >

  <select
    v-else-if="optionDefinition.type === 'boolean'"
    v-model="data"
    :required="optionDefinition.required"
    :class="{'form-item__input--is-default': !valueHasBeenSet}"
  >
    <option value="true" :selected="optionDefinition.default === 'true'">
      True
    </option>
    <option value="false" :selected="optionDefinition.default === 'false'">
      False
    </option>
  </select>

  <div v-else-if="isArrayInput">
    <textarea
      v-model="data"
      :required="optionDefinition.required"
      :placeholder="optionDefinition.default"
      :class="['form-item__input', {'form-item__input--is-default': !valueHasBeenSet}]"
    />
    <span class="form-item__hint form-item__hint--block">
      Enter one item per line
    </span>
  </div>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'OptionInput',
  props: {
    optionDefinition: {
      required: true,
      type: Object,
    },
    modelValue: {
      type: [String, Number, Boolean, Array],
      required: false,
      default: null,
    },
  },

  mounted() {
    if (!this.valueHasBeenSet) {
      this.data = this.optionDefinition.default ?? null;
    }
  },

  computed: {
    data: {
      get() {
        return this.modelValue;
      },
      set(value) {
        // ensure data is emitted as correct type (default emitted as string)
        if (this.isNumberInput) {
          value = parseFloat(value);
        } else if (this.isBooleanInput) {
          value = value === 'true';
        } else if (this.isArrayInput && Array.isArray(value)) {
          value = value.join('\n');
        }

        this.$emit('update:modelValue', value);
        this.setChildHasUnsavedChanges(true);
      },
    },

    /**
     * whether the value of the input has been set
     * either by the parent v-model, or by a selection made in this form
     * if false, the default value is pre-filled (but not outputted)
     *
     * @return {boolean}
     */
    valueHasBeenSet() {
      return !(this.data === null || this.data === undefined);
    },

    /**
     * The values that are permitted for this option
     * Returns null if permitted values are not set
     * (meaning that any value is permitted)
     */
    allowedValues() {
      return this.optionDefinition.allowed_values ?? null;
    },

    isSelectInput() {
      // eslint-disable-next-line no-prototype-builtins
      return this.optionDefinition.hasOwnProperty('allowed_values');
    },

    isStringInput() {
      const type = this.optionDefinition.type;
      return type.includes('string') || type.includes('datetime');
    },

    isArrayInput() {
      const type = this.optionDefinition.type;
      return type.includes('array');
    },

    isNumberInput() {
      const type = this.optionDefinition.type;
      return type === 'numeric' || type === 'integer' || type === 'float';
    },

    isBooleanInput() {
      return this.optionDefinition.type === 'boolean';
    },

    numberInputStep() {
      if (this.optionDefinition.type === 'integer') {
        return 1;
      }
      return 0.01;
    }
  },
  methods: {
    ...mapActions(useMappingTransformationsStore, [
      'setChildHasUnsavedChanges'
    ]),
  }
};
</script>
