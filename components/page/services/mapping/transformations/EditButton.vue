<template>
  <button
    class="button button-secondary button-sm"
    @click="openTransformationEditor"
  >
    <span class="icon icon--pencil mr-2" />
    <span>
      {{ buttonText }}

      <span
        v-if="functionCount > 0"
        class="button__sub-text whitespace-nowrap"
      >
        ({{ buttonSubText }})
      </span>
    </span>
  </button>
</template>

<script>
import { mapActions, mapState } from 'pinia';
import clone from 'just-clone';

export default {
  name: 'EditButton',

  props: {
    /**
     * The current value of the 'pw_value' field for this mapping line
     * If no ScriptLibrary or old-style function string is present, this is used as input_key for the ScriptLibrary string
     * This data is provided via the v-model
     */
    modelValue: {
      required: true,
      type: String,
    },

    /**
     * A unique id for this mapping line
     */
    lineId: {
      required: true,
      type: String,
    },

    /**
     * Optionally specify the input_key for the ScriptLibrary string
     * This is used as fallback only - priority is:
     * 1) input_key value from ScriptLibrary string
     * 2) 'value' prop (v-model), unless is an old-style function
     * 3) this fallback value
     * 4) input_key not set (valid for some functs)
     *
     * Also used to trigger an update when the input key is changed after the transform is created
     */
    inputKeyFallback: {
      required: false,
      type: [String, undefined, null],
      default: undefined,
    },

    /**
     * The data type for this mapping line
     * Can be found in pw_field_type, if is set
     * Will be overridden by existing transformation string in pwValue prop
     */
    sourceDataType: {
      required: false,
      type: [String, undefined, null],
      default: undefined,
    },

    /**
     * The data type output by this mapping line
     * Wil be overridden by existing transformation string in pwValue prop
     */
    destinationDataType: {
      required: false,
      type: [String, undefined, null],
      default: undefined,
    },

    /**
     * Whether the user is permitted to change the 'source' data type
     * User selections are saved in the transformation string
     * And override any value set in sourceDataType prop
     */
    sourceTypeEditable: {
      required: false,
      type: Boolean,
      default: false,
    },

    /**
     * Whether the user is permitted to change the 'destination' data type
     * User selections are saved in the transformation string
     * And override any value set in destinationDataType prop
     */
    destinationTypeEditable: {
      required: false,
      type: Boolean,
      default: false,
    },

    sourceData: {
      required: false,
      type: [Object, undefined, null],
      default: undefined,
    },
  },

  data() {
    return {
      inputKey: null,
      transformation: null,
      valueIsTransformOrFunction: false,
    };
  },

  computed: {
    ...mapState(useMappingTransformationsStore, {
      selectedField: 'selectedField',
      stringToSave: 'newTransformationString',
      saveRequested: 'saveRequested',
    }),

    /**
     * Converts the data provided in props into a format the rest of the UI can use
     * Transformation is passed as a string (not in decoded format)
     */
    field() {
      return {
        id: this.lineId,
        source_field: this.inputKey,
        source_field_path: this.sourceData?.metadata?.path,
        source_type: this.useDefaultIfNotSet(this.sourceDataType, 'string'),
        destination_type: this.useDefaultIfNotSet(
          this.destinationDataType,
          'string'
        ),
        transformation:
          this.valueIsTransformOrFunction === true ? this.modelValue : '',
      };
    },

    buttonText() {
      return 'Transformations';
    },

    buttonSubText() {
      if (this.functionCount === 0) {
        return null;
      } else if (this.functionCount === 1) {
        return `${this.functionCount} function`;
      }
      return `${this.functionCount} functions`;
    },

    functionCount() {
      if (this.field.transformation === '') {
        return 0;
      }
      try {
        return this.decodeTransformation(this.field.transformation, false)
          .scripts.length;
      } catch {
        return '?';
      }
    },
  },
  watch: {
    /**
     * If the input key is changed after a transform has already been added
     * Validate the transform is still valid
     * Update the transform string & v-model to reflect the new input key
     */
    inputKeyFallback: {
      immediate: false,
      handler(newInputKey) {
        const transformation = this.field.transformation;
        const existingSourceField = this.field.source_field;
        if (transformation && newInputKey !== existingSourceField) {
          // if a transform exists, and inputKeyFallback changes and does not match field.source_field

          // validate the existing transform against the new input key
          if (
            this.functionsNonMatchingType(
              this.transformation.scripts,
              this.field
            ).length > 0
          ) {
            this.$emit('transformation-errors', [
              'The transformation is invalid - please open the editor to check for errors',
            ]);
            // this.$nextTick(function () {
            //   this.openTransformationEditor()
            // })
          } else {
            this.$emit('transformation-errors', []);
          }

          // create a new transform string with the new input key
          const fieldClone = clone(this.field);
          fieldClone.source_field = newInputKey;
          const updatedTransformString = this.createTransformationString(
            this.transformation.scripts,
            fieldClone
          );

          // emit the new transform string so the parent updates
          this.$emit('update:modelValue', updatedTransformString);

          // update the local state based on the new transform string
          this.$nextTick(function () {
            this.determineInitialValues();
          });
        } else if (
          !transformation &&
          (!existingSourceField || existingSourceField !== newInputKey)
        ) {
          // is a new row (no source_field or transformation is set), or is an existing row with no transform
          // set the inputKey
          this.inputKey = newInputKey ?? '';
        }
      },
    },
    /**
     * Update v-model in response to saveRequested
     *
     * if this button is for the current selectedField
     * emit change to update v-model
     * emit event with new source and destination types
     * then clear all selections & close modal
     */
    saveRequested: {
      immediate: false,
      handler() {
        if (
          this.saveRequested === true &&
          this.selectedField &&
          this.selectedField.id === this.field.id
        ) {
          // emit event to update v-model with new transformation string
          this.$emit('update:modelValue', this.stringToSave);

          // emit any source/dest type changes
          this.emitSourceAndDestinationTypeChanges();

          // nextTick is used to ensure that the computed values have updated before emit
          this.$nextTick(function () {
            // emit the number of transformations
            this.emitFunctionCount();

            // update the local state with newly-saved transformation
            this.determineInitialValues();
          });

          // reset and close
          this.$emit('transformation-errors', []);
          this.resetAll();
          this.closeModal();
        }
      },
    },
  },
  mounted() {
    this.determineInitialValues();
  },
  methods: {
    ...mapActions(useMappingTransformationsStore, [
      'selectField',
      'resetAll',
      'setFieldSourceDestTypeEditable',
    ]),

    ...mapActions(useMappingTransformationsStore, {
      decodeTransformation: 'decodeTransformationString',
      createTransformationString: 'createTransformationString',
      functionsNonMatchingType:
        'computeFunctionIndexesWithNonMatchingInputType',
    }),

    ...mapActions(useUiStore, ['openModal', 'closeModal']),

    /**
     * Extracts the source field (input_key) from the pw_value field - can be null as not all scripts require an input
     * Sets a 'transformation' if pw_value is a ScriptLibrary or old-style function string, otherwise is empty
     */
    determineInitialValues() {
      if (this.modelValue) {
        // if current value is a scriptLibrary string, extract the data
        try {
          this.transformation = this.decodeTransformation(
            this.modelValue,
            true
          );
          this.inputKey = this.transformation.input_key ?? '';
          this.valueIsTransformOrFunction = true;
        } catch {
          // it's not a scriptLibrary string
          if (this.modelValue.includes('::')) {
            // it's an old-style function
            // we can't extract the input key from this - use the fallback prop if set
            this.inputKey =
              this.inputKeyFallback !== undefined
                ? this.inputKeyFallback
                : null;
            this.valueIsTransformOrFunction = true;
          } else {
            // current value is just a string,
            // so is the key of the (from) field and can be can be used directly as inputKey
            this.inputKey = this.modelValue;
            this.valueIsTransformOrFunction = false;
          }
        }
      }
    },

    openTransformationEditor() {
      this.selectField(this.field);
      this.openModal('transformationEditor');
      this.setFieldSourceDestTypeEditable(
        this.sourceTypeEditable,
        this.destinationTypeEditable
      );
    },

    /**
     * If source_type or destination_type have changed
     * Compared to the original 'field' prop
     * Emit an event with the new values
     */
    emitSourceAndDestinationTypeChanges() {
      const typesObj = {};
      if (this.field.source_type !== this.selectedField.source_type) {
        typesObj.source_type = this.selectedField.source_type;
      }
      if (this.field.destination_type !== this.selectedField.destination_type) {
        typesObj.destination_type = this.selectedField.destination_type;
      }

      if (Object.values(typesObj).length > 0) {
        this.$emit('field-data-type-updated', typesObj);
      }
    },

    emitFunctionCount() {
      let count = 0;
      try {
        count = this.decodeTransformation(this.field.transformation, false)
          .scripts.length;
      } catch {
        // cannot decode - do nothing, 0 will be emitted as value
      } finally {
        this.$emit('transform-function-count', count);
      }
    },

    useDefaultIfNotSet(value, defaultValue) {
      if (value === undefined || value === null) {
        return defaultValue;
      }
      return value;
    },
  },
};
</script>
