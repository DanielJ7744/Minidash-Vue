<template>
  <div>
    <div class="h6">Function Settings</div>

    <form class="space-y-2" @submit.prevent="saveFunctionChanges">
      <FormElement
        v-model="functionId"
        title="function_name"
        label="Function Name"
        :errors="errors"
        v-slot="{ inputProps, inputEvents }"
        :class="{ 'col-span-2': creatingNewFunction }"
      >
        <select class="w-full" v-bind="inputProps" v-on="inputEvents">
          <option
            v-for="funct in availableFunctions"
            :key="funct.id"
            :value="funct.id"
          >
            {{ funct.attributes.name }}
          </option>
        </select>
      </FormElement>

      <template v-if="currentFunctSpecialType === null">
        <FormElement
          v-for="field in orderedFields"
          :key="field.key"
          :title="field.key"
          :label="field.description"
          :required="field.required || field.ui_required"
          :errors="errors"
        >
          <PageServicesMappingTransformationsOptionInput
            v-if="field.field_type === 'option'"
            v-model="optionValues[field.key]"
            :option-definition="field"
          />

          <PageServicesMappingFieldSelect
            v-else-if="field.field_type === 'additional_input'"
            v-model="additionalInputValues[field.key]"
            :options="fieldSchema"
          />
        </FormElement>
      </template>

      <PageServicesMappingTransformationsSpecialTypesMapFunctionSettings
        v-else-if="currentFunctSpecialType === 'map'"
        v-model="optionValues"
        :funct-definition="currentFunctDefinition"
        class="col-span-2"
      />
      <PageServicesMappingTransformationsSpecialTypesScriptFunctionSettings
        v-else-if="currentFunctSpecialType === 'customScript'"
        v-model="optionValues"
        @additionalInput="additionalInputValues = $event"
        class="col-span-2"
      />

      <div class="col-span-2 text-sm">
        <span class="text-danger-800">*</span>
        denotes a required field. Default values are shown (where applicable).
      </div>

      <UiMessage v-if="!inputTypeMatch" type="warning" icon="warning">
        The previous step in the transformation has an output type of
        <strong>{{ outputTypePrevious }}</strong
        >, but this function requires an input type of
        <strong>{{ inputTypeForCurrentFunct }}</strong>
        <br />
        Please select a different function, or change the previous step
      </UiMessage>

      <UiMessage v-if="!outputTypeMatch" type="warning" icon="warning">
        The next step in the transformation expects an input type of
        <strong>{{ inputTypeNext }}</strong
        >, but the selected function has an output type of
        <strong>{{ outputTypeForCurrentFunct }}</strong>
      </UiMessage>

      <hr class="col-span-2" />
      <div
        class="col-span-2 flex flex-col-reverse justify-end gap-x-1 md:flex-row"
      >
        <button
          type="button"
          class="button button-secondary"
          @click="cancelFunctionChanges"
        >
          Cancel
        </button>
        <button
          v-if="functionId"
          type="button"
          class="button button-secondary"
          @click="deleteFunction"
        >
          Delete Function
        </button>
        <button
          v-if="functionId"
          type="submit"
          class="button button-primary"
          :disabled="hasValidationErrors"
        >
          Save Function
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import clone from 'just-clone';
import { transformationsFunctionSettingsMixin } from '@/mixins/transformations/transformations-function-settings-mixin';

export default {
  name: 'FunctionSettings',
  mixins: [transformationsFunctionSettingsMixin],

  data() {
    return {
      functionId: null,
      // optionValues and errors data comes from the transformations-function-settings-mixin
    };
  },

  computed: {
    ...mapState(useMappingTransformationsStore, {
      allFunctions: 'functionDefinitions',
      functionIndex: 'selectedFunctionIndex',
      creatingNewFunction: 'addingNewFunct',
      fieldSchema: 'sourceSchema',
      initialSelectedFunction: 'selectedFunction',
      selectedFunction: 'selectedFunction',
      functionsWithMatchingTypes: 'functionsWithMatchingTypes',
      transformationLength: 'transformationInEditLength',
      outputTypePrevious: 'outputTypePrevious',
      inputTypeNext: 'inputTypeNext',
    }),

    formattedOptionValues() {
      if (!this.currentFunctHasOptions) {
        return this.optionValues;
      }

      return Object.fromEntries(
        Object.entries(this.optionValues).map(([key, value]) => {
          const [name, option] = Object.entries(this.currentFunctOptions).find(
            ([name]) => name === key
          );

          // if the type is array and a value has been entered, split the value string into a proper array
          // else, just return the value
          return option.type === 'array' && value
            ? [name, value.split('\n')]
            : [name, value];
        }, this)
      );
    },

    availableFunctions() {
      const matchingFunctions = Object.assign(
        [],
        this.functionsWithMatchingTypes
      );

      // don't modify matching if are adding a new funct
      // as won't have a saved function at this point
      if (!this.creatingNewFunction) {
        // if not already present, add the selected function from the store
        // so it doesn't disappear from the list if the previous type has changed
        const selectedFunctId = this.selectedFunction.script_id;
        const currentInAvailable = matchingFunctions.some(
          (funct) => funct.id === selectedFunctId
        );

        if (!currentInAvailable) {
          const definitionForSelected = this.allFunctions.find(
            (funct) => funct.id === selectedFunctId
          );
          matchingFunctions.push(definitionForSelected);
        }
      }
      return matchingFunctions;
    },

    /**
     * Current Function Definition
     * Returns the definition for the _current_ function,
     * as selected via the dropdown in this component
     * may be _different_ from 'selectedFunction' in the store
     * as the store is not updated until 'save' is clicked
     */
    currentFunctDefinition() {
      if (!this.functionId) {
        return null;
      }
      return this.allFunctions.find((funct) => {
        return parseInt(funct.id) === parseInt(this.functionId);
      });
    },

    /**
     * Options available for the selected function
     */
    currentFunctOptions() {
      if (!this.currentFunctDefinition) {
        return null;
      }
      return this.currentFunctDefinition.attributes.options;
    },

    /**
     * Additional inputs for the selected function
     */
    currentFunctAdditionalInputs() {
      if (!this.currentFunctDefinition) {
        return null;
      }

      const additionalInputFields =
        this.currentFunctDefinition.attributes.additional_inputs;
      return clone(additionalInputFields);
    },

    /**
     * Both options and additional_input fields can have an 'order' specified
     * Combine and sort the two field types into one array
     * So that can be rendered in the correct order
     */
    orderedFields() {
      let additionalInputsWithType = [];
      if (this.currentFunctAdditionalInputs) {
        additionalInputsWithType = Object.keys(
          this.currentFunctAdditionalInputs
        ).map((key) => {
          const field = this.currentFunctAdditionalInputs[key];
          const newField = clone(field);
          newField.key = key;
          newField.field_type = 'additional_input';
          return newField;
        });
      }

      let optionsWithType = [];
      if (this.currentFunctOptions) {
        optionsWithType = Object.keys(this.currentFunctOptions).map((key) => {
          const field = this.currentFunctOptions[key];
          const newField = clone(field);
          newField.key = key;
          newField.field_type = 'option';
          return newField;
        });
      }
      const combined = additionalInputsWithType.concat(optionsWithType);

      return combined.sort((fieldA, fieldB) => {
        return fieldA.order - fieldB.order;
      });
    },

    /**
     * If the selected function has options
     * @return {boolean}
     */
    currentFunctHasOptions() {
      return (
        this.currentFunctOptions &&
        Object.keys(this.currentFunctOptions).length > 0
      );
    },

    outputTypeForCurrentFunct() {
      if (!this.currentFunctDefinition) {
        return null;
      }
      return this.currentFunctDefinition.attributes.output.type ?? null;
    },

    inputTypeForCurrentFunct() {
      if (!this.currentFunctDefinition) {
        return null;
      }
      return this.currentFunctDefinition.attributes.input.type ?? null;
    },

    /**
     * Whether the current function has a 'special type'
     */
    currentFunctSpecialType() {
      if (!this.currentFunctDefinition) {
        return null;
      }
      return this.currentFunctDefinition.attributes.special_type;
    },

    /**
     * Whether the output type of the selected function
     * Matches the input type of the next
     */
    outputTypeMatch() {
      return this.checkTypesMatch(
        this.outputTypeForCurrentFunct,
        this.inputTypeNext
      );
    },

    /**
     * Whether the input type of the selected function
     * matches the output type of the previous
     */
    inputTypeMatch() {
      return this.checkTypesMatch(
        this.outputTypePrevious,
        this.inputTypeForCurrentFunct
      );
    },

    hasValidationErrors() {
      return Object.values(this.errors).length > 0;
    },
  },
  watch: {
    /**
     * Watch for changes in the function selected for editing when the component is loaded
     * This will change when the selectedFunction in the store updates
     * which happens when a new function is selected from the 'organiser' list
     *
     * There is nothing to set up if we are creating a new function
     */
    initialSelectedFunction: {
      immediate: true,
      deep: true,
      handler() {
        if (!this.creatingNewFunction) {
          this.setInitialFunctionData();
        } else {
          this.setCreateFunctionData();
        }
      },
    },
    /**
     * Watch for changes in the functionId
     * This will change when a new function selected from dropdown within this component
     * Will _not_ be triggered on initial function selection
     * Will be triggered when a new function is being added/created (functionId set to null)
     */
    functionId: {
      handler(newVal) {
        // only run if this is not the initially selected function
        // and a functionId is set (will not be set if is createNewFunct)
        if (
          newVal !== this.initialSelectedFunction.script_id &&
          this.functionId
        ) {
          this.setChangedFunctionData();
        }
      },
    },
  },
  methods: {
    ...mapActions(useMappingTransformationsStore, [
      'selectField',
      'selectFunctionIndex',
      'changeFunctionInTransformation',
      'addNewFunctionClose',
      'setChildHasUnsavedChanges',
      'mergeDefinitionWithTransformation',
      'checkTypesMatch',
    ]),

    /**
     * When a function is initially selected for editing
     * Set the ID of the function (so can be used to look up definition)
     * And set up the object to store the values of the options
     */
    setInitialFunctionData() {
      const initialSelectedFunct = this.initialSelectedFunction;
      this.functionId = initialSelectedFunct.script_id;

      // set keys for 'options' data and populate with existing values
      this.setKeysForFieldValues(this.currentFunctOptions, 'optionValues');
      this.optionValues = Object.assign(
        this.optionValues,
        initialSelectedFunct.options
      );

      // set keys for 'additional_inputs' data and populate with existing values
      this.setKeysForFieldValues(
        this.currentFunctAdditionalInputs,
        'additionalInputValues'
      );
      this.additionalInputValues = Object.assign(
        this.additionalInputValues,
        initialSelectedFunct.additional_inputs
      );
    },

    /**
     * Called when a new function is selected from the dropdown in this component
     * Sets up the component data ready for this new function
     */
    setChangedFunctionData() {
      this.setKeysForFieldValues(this.currentFunctOptions, 'optionValues');
      this.setKeysForFieldValues(
        this.currentFunctAdditionalInputs,
        'additionalInputValues'
      );
    },

    /**
     * Called when the 'add new function' option is selected
     */
    setCreateFunctionData() {
      this.functionId = null;
      this.optionValues = {};
      this.additionalInputValues = {};
    },

    /**
     * Saves changes made to the function in this component
     * By updating the store with the changes
     * NB, this doesn't save the transformation overall, just the single function
     */
    saveFunctionChanges() {
      // object in the same format as that originally found in the TransformationString
      const newTransformation = {
        script_id: parseInt(this.functionId),
        options: this.formattedOptionValues,
        additional_inputs: this.additionalInputValues,
      };

      // use the same method to merge definition as when the string originally decoded
      // to ensure consistency of format
      const newTransformationWithDefinition =
        this.mergeDefinitionWithTransformation(newTransformation);

      // for a switch of an existing function to a different one
      let indexToUpdate = this.functionIndex;
      let replaceExisting = true;

      // for adding a brand-new function to the transformation
      if (this.creatingNewFunction) {
        indexToUpdate = this.transformationLength; // is 0-indexed, so length === index for additional item
        replaceExisting = false;
      }

      this.validate().then((passed) => {
        this.changeFunctionInTransformation(
          indexToUpdate,
          newTransformationWithDefinition,
          replaceExisting
        );
        this.setChildHasUnsavedChanges(false);
        this.addNewFunctionClose();
      });
    },

    cancelFunctionChanges() {
      // deselect function on cancel
      this.selectFunctionIndex(null);
      this.setChildHasUnsavedChanges(false);
      this.addNewFunctionClose();
    },

    deleteFunction() {
      const confirmed = confirm(
        'Are you sure you want to delete this function from the transformation?'
      );
      if (confirmed) {
        const indexToUpdate = this.functionIndex;
        this.changeFunctionInTransformation({
          indexForNewFunct: indexToUpdate,
          newFunct: false,
          replace: true,
        });
        this.setChildHasUnsavedChanges(false);
      }
    },

    validate() {
      // clear existing errors
      this.errors = {};

      const validateFields = (definitions, values) => {
        return new Promise((resolve, reject) => {
          for (const [optionKey, optionDefinition] of Object.entries(
            definitions
          )) {
            const fieldValue = values[optionKey];
            const errorsForField = [];

            const emptyValues = [null, undefined, ''];

            const isRequired =
              optionDefinition.required === true ||
              optionDefinition.ui_required === true;
            const isEmpty = emptyValues.includes(fieldValue);

            // check required values are present
            if (isRequired && isEmpty) {
              Object.assign(errorsForField, ['This field is required']);
            }

            // check numeric type fields
            const numericTypes = ['number', 'integer', 'float', 'numeric'];
            if (numericTypes.includes(optionDefinition.type)) {
              // if is not a number, unless is empty & not required
              if (isNaN(parseFloat(fieldValue)) && !(isEmpty && !isRequired)) {
                Object.assign(errorsForField, ['Value must be a number']);
              }
            }

            // if field has errors, add to main errors object
            // and fail the promise
            if (Object.values(errorsForField).length > 0) {
              Object.assign(this.errors, { [optionKey]: errorsForField });

              // eslint-disable-next-line prefer-promise-reject-errors
              reject('validation failed');
            }
          }
          resolve(true);
        });
      };

      const validateOptions = validateFields(
        this.currentFunctOptions,
        this.optionValues
      );
      const validateAdditionalInputs = validateFields(
        this.currentFunctAdditionalInputs,
        this.additionalInputValues
      );
      return Promise.all([validateOptions, validateAdditionalInputs]);
    },
  },
};
</script>
