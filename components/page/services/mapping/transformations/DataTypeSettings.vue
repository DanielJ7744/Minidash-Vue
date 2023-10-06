<template>
  <div>
    <div class="h4">Set Data Type for {{ editorName }}</div>

    <form class="grid grid-cols-2 gap-y-2" @submit.prevent="saveChanges">
      <div class="col-span-2 text-sm">
        Please only change this value if you are certain the new data type is
        correct. Otherwise, data transformation will fail.
      </div>

      <FormElement
        v-model="selectedType"
        title="data_type"
        label="Data Type"
        v-slot="{ inputProps, inputEvents }"
        class="col-span-2"
      >
        <select
          class="w-full"
          v-bind="inputProps"
          v-on="inputEvents"
          @input="setUnsavedChanges(true)"
        >
          <option v-for="(label, type) in dataTypes" :value="type" :key="type">
            {{ label }}
          </option>
        </select>
      </FormElement>

      <div
        v-if="editingSourceOrDestination === 'source' && !outputTypeMatch"
        class="two-column-grid__span-all form-item"
      >
        <div class="message message--notice message--icon">
          <span class="message__icon icon icon--warning"></span>
          <div class="message__body">
            The next function in the transformation expects an input type of
            <strong>{{ inputTypeNext }}</strong
            >, but the field has a source type of
            <strong>{{ selectedType }}</strong>
          </div>
        </div>
      </div>

      <div
        v-if="
          editingSourceOrDestination === 'destination' &&
          !destinationTypeMatches
        "
        class="col-span-2"
      >
        <div class="message message--notice message--icon">
          <span class="message__icon icon icon--warning"></span>
          <div class="message__body">
            The final function in the transformation has an output type of
            <strong>{{ outputTypePrevious }}</strong
            >, but the destination type is set to
            <strong>{{ selectedType }}</strong>
          </div>
        </div>
      </div>

      <div class="col-span-2 flex justify-around">
        <button type="button" class="button button-secondary">Cancel</button>
        <button
          v-if="childHasUnsavedChanges"
          type="submit"
          class="button button-primary"
        >
          Save Data Type
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia';

export default {
  name: 'DataTypeSettings',

  data() {
    return {
      selectedType: null,
      dataTypes: {
        string: 'String (string)',
        integer: 'Whole Number (integer)',
        float: 'Number with Decimals (float)',
        boolean: 'True / False value (boolean)',
        datetime: 'Date / Datetime (datetime)',
        array: 'Array (array)'
      },
    };
  },

  computed: {
    ...mapState(useMappingTransformationsStore, {
      field: 'selectedField',
      editingSourceOrDestination: 'editingFieldType',
      typeMatchFails: 'functionIndexesWithNonMatchingInputType',
      childHasUnsavedChanges: 'childHasUnsavedChanges',
      outputTypePrevious: 'outputTypePrevious',
      inputTypeNext: 'inputTypeNext',
    }),
    editorName() {
      const string = this.editingSourceOrDestination;
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    /**
     * Whether the selected type
     * Matches the input type of the next function
     */
    outputTypeMatch() {
      if (this.editingSourceOrDestination === 'source') {
        return this.checkTypesMatch(this.selectedType, this.inputTypeNext);
      }
      return null;
    },
    /**
     * Whether the output from the final function
     * matches the destination type
     */
    destinationTypeMatches() {
      return this.checkTypesMatch(this.outputTypePrevious, this.selectedType);
    },
  },
  watch: {
    /**
     * Sets the initial value of the dropdown
     * Whenever switches between source / dest, and on load
     */
    editingSourceOrDestination: {
      immediate: true,
      handler() {
        this.setInitialType();
      },
    },
  },
  methods: {
    ...mapActions(useMappingTransformationsStore, {
      setEditingFieldType: 'setEditingFieldType',
      saveDataType: 'updateFieldDataType',
      setUnsavedChanges: 'setChildHasUnsavedChanges',
      checkTypesMatch: 'checkTypesMatch',
    }),

    setInitialType() {
      const fieldForType = `${this.editingSourceOrDestination}_type`;
      this.selectedType = this.field[fieldForType];
    },

    saveChanges() {
      this.saveDataType(this.editingSourceOrDestination, this.selectedType);
      this.setUnsavedChanges(false);
    },

    cancelChanges() {
      this.setEditingFieldType(null);
      this.setUnsavedChanges(false);
    },
  },
};
</script>
