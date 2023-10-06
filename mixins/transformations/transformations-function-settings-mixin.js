import { mapActions } from 'pinia';

export const transformationsFunctionSettingsMixin = {
  /**
   * ================================================================================
   * Houses common data and functionality for 'function settings' components
   * ================================================================================
   */

  data() {
    return {
      optionValues: {},
      additionalInputValues: {},
      errors: {},
    };
  },

  methods: {
    ...mapActions(useMappingTransformationsStore, [
      'setChildHasUnsavedChanges',
    ]),

    /**
     * Pass the definitions of a set of fields (eg options, additional_inputs)
     * And the data property where the field values will be stored
     * Adds a key for each field to the data property, which value is stored under
     *
     * @param fieldDefinitions Object: Object containing the definition for each field
     * @param propertyName String: Name of the property to add keys to - will be used to store the field values
     */
    setKeysForFieldValues(fieldDefinitions, propertyName) {
      const fieldKeys = Object.keys(fieldDefinitions);
      const newFieldValues = fieldKeys.reduce((acc, curr) => {
        acc[curr] = null;
        return acc;
      }, {});
      this[propertyName] = Object.assign({}, newFieldValues);
    },
  },
};
