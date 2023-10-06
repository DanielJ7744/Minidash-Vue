import { defineStore } from 'pinia';

export const useMappingTransformationsStore = defineStore(
  'mappingTransformations',
  {
    state: () => {
      return {
        prefixForMappingFile: 'scriptLibrary::',
        functionDefinitions: [],
        selectedField: null,
        fieldSourceTypeEditable: false,
        fieldDestinationTypeEditable: false,
        editingFieldType: null,
        transformationInEdit: null,
        existingTransformationUnreadable: false,
        selectedFunctionIndex: null,
        childHasUnsavedChanges: false,
        newTransformationString: '',
        saveRequested: false,
        addingNewFunct: false,
        mapPresets: [],
        sourceSchema: [],
      };
    },
    getters: {
      selectedFunction() {
        if (this.addingNewFunct === true) {
          return {
            script_id: null,
            name: '',
            definition: {},
            options: {},
          };
        } else if (
          this.selectedFunctionIndex === null ||
          !this.functionDefinitionsLoaded
        ) {
          return null;
        }
        return this.transformationInEdit[this.selectedFunctionIndex];
      },

      functionDefinitionsLoaded() {
        return this.functionDefinitions.length > 0;
      },

      /**
       * Returns the length (function count)
       * Of the currently edited transformation
       */
      transformationInEditLength() {
        if (!this.transformationInEdit) {
          return 0;
        }
        return this.transformationInEdit.length;
      },

      /**
       * Index of any chosen function where the input type
       * does not match the output type from the previous function
       * may also return 'destination' if destination type does not match
       *
       * Optionally pass a transformation and field to evaluate these instead of the selected one
       */
      functionIndexesWithNonMatchingInputType() {
        return this.computeFunctionIndexesWithNonMatchingInputType(
          this.transformationInEdit,
          this.selectedField
        );
      },

      functionsWithMatchingTypes() {
        return this.functionDefinitions.filter((funct) => {
          const inputType = funct.attributes.input.type ?? null;

          // input type matches output type?
          return this.checkTypesMatch(this.outputTypePrevious, inputType);
        });
      },

      /*
       * Converts transformationInEdit into string format
       * As is saved in the the mapping file
       */
      transformationInEditAsString() {
        if (this.transformationInEdit) {
          return this.createTransformationString(this.transformationInEdit);
        }
        return '';
      },

      outputTypePrevious() {
        if (
          this.selectedField === null ||
          ((this.selectedFunctionIndex === null ||
            !this.functionDefinitionsLoaded) &&
            this.editingFieldType !== 'destination' &&
            this.addingNewFunct === false)
        ) {
          return null;
        }
        let indexForPrevFunct = null;
        if (this.editingFieldType === 'destination' || this.addingNewFunct) {
          // if editing destination, or adding new, use final function as 'previous'
          indexForPrevFunct = this.transformationInEditLength - 1;
        } else {
          indexForPrevFunct = this.selectedFunctionIndex - 1;
        }

        if (indexForPrevFunct < 0) {
          // there is no previous function - return source type of field
          return this.selectedField.source_type;
        }
        const previousFunctToSelected =
          this.transformationInEdit[indexForPrevFunct];
        return previousFunctToSelected.definition.output.type ?? null;
      },

      inputTypeNext() {
        if (
          (this.selectedFunctionIndex === null ||
            !this.functionDefinitionsLoaded) &&
          this.editingFieldType !== 'source'
        ) {
          return null;
        }
        let indexForNextFunct = null;
        if (this.editingFieldType === 'source') {
          // if editing source, use first function as 'next'
          indexForNextFunct = 0;
        } else {
          // get the next function after the currently selected one
          indexForNextFunct = this.selectedFunctionIndex + 1;
        }

        if (indexForNextFunct > this.transformationInEdit.length - 1) {
          // there is no next function - return destination type of field
          return this.selectedField.destination_type;
        }
        const nextFunctToSelected =
          this.transformationInEdit[indexForNextFunct];
        return nextFunctToSelected.definition.input.type ?? null;
      },
    },
    actions: {
      async selectField(fieldData) {
        const fieldDataObject = Object.assign({}, fieldData);
        // check if the definitions are loaded, load if not
        if (!this.functionDefinitionsLoaded) {
          await this.setFunctionDefinitions();

          this.selectedField = fieldDataObject;
          this.setTransformationInEdit();
        } else {
          this.selectedField = fieldDataObject;
          this.setTransformationInEdit();
        }
      },

      async setFunctionDefinitions() {
        const response = await useFabric('/api/v1/transform-scripts/scripts');
        this.functionDefinitions = response.data.sort((mapOne, mapTwo) => {
          if (mapOne.attributes.name < mapTwo.attributes.name) {
            return -1;
          }
          if (mapOne.attributes.name > mapTwo.attributes.name) {
            return 1;
          }
          return 0;
        });
      },

      setFieldSourceDestTypeEditable(
        sourceTypeEditable,
        destinationTypeEditable
      ) {
        this.fieldSourceTypeEditable = sourceTypeEditable;
        this.fieldDestinationTypeEditable = destinationTypeEditable;
      },

      setEditingFieldType(field) {
        // non-null field means editor being opened
        // check for unsaved changes elsewhere
        // close other editors
        if (field !== null) {
          this.triggerUnsavedChangesWarning();
          this.editingFieldType = field;
          this.addNewFunctionClose();
          this.selectFunctionIndex(null);
        } else {
          // closing field type editor
          this.editingFieldType = field;
        }
      },

      updateFieldDataType(sourceOrDest, value) {
        const currentFieldData = this.selectedField;
        const propertyToUpdate = `${sourceOrDest}_type`;

        this.selectedField = Object.assign({}, currentFieldData, {
          [propertyToUpdate]: value,
        });
        this.setEditingFieldType(null);
      },

      setTransformationInEdit() {
        if (this.selectedField) {
          try {
            const transformationData = this.decodeTransformationString(
              this.selectedField.transformation
            );

            this.transformationInEdit = transformationData.scripts;

            // set the start and end types, if exist in the transformation string
            // this overrides anything set in the main field data
            if (transformationData.source_type) {
              this.updateFieldDataType(
                'source',
                transformationData.source_type
              );
            }
            if (transformationData.destination_type) {
              this.updateFieldDataType(
                'destination',
                transformationData.destination_type
              );
            }
          } catch {
            // existing transformation could not be read - handle this
            this.setExistingTransformationUnreadable(true);
            this.transformationInEdit = [];
          }
        } else {
          // no selected field, transformation is null
          this.transformationInEdit = null;
        }
      },

      mergeDefinitionWithTransformation(transformation) {
        const definition = this.getDefinitionById(transformation.script_id);

        if (definition) {
          transformation.name = definition.attributes.name;
          transformation.definition = {
            input: definition.attributes.input,
            output: definition.attributes.output,
            additional_inputs: definition.attributes.additional_inputs,
            options: definition.attributes.options,
          };
        } else {
          // eslint-disable-next-line no-console
          console.warn(
            `Function definition not found for script id ${transformation.script_id}`
          );
        }
        return transformation;
      },

      getDefinitionById(scriptId) {
        if (this.functionDefinitionsLoaded) {
          return this.functionDefinitions.find(
            (script) => script.id === scriptId
          );
        }
        // eslint-disable-next-line no-console
        console.warn('function definitions not loaded');
        return null;
      },

      setExistingTransformationUnreadable(value) {
        this.existingTransformationUnreadable = value;
      },

      setNewTransformationString(string) {
        this.newTransformationString = string;
      },

      setSaveRequested(value) {
        this.saveRequested = value;
      },

      /**
       * Selects a new function to be edited, via index
       * Will not run if there are unsaved changes
       */
      selectFunctionIndex(index) {
        if (index === null) {
          // null index means we're cancelling changes / deselecting function
          this.selectedFunctionIndex = index;
        } else {
          this.triggerUnsavedChangesWarning();
          this.selectedFunctionIndex = index;
          this.setEditingFieldType(null);
          this.addNewFunctionClose();
        }
      },
      setChildHasUnsavedChanges(value) {
        this.childHasUnsavedChanges = value;
      },
      /**
       * Checks for unsaved changes
       * And displays a warning message if there are
       */
      triggerUnsavedChangesWarning(suppressMessage = false) {
        if (this.childHasUnsavedChanges) {
          if (!suppressMessage) {
            this.$notify(
              {
                group: 'notifications',
                type: 'error',
                text: 'There are unsaved changes which will be lost - please either save or cancel your changes, then try again',
              },
              4000
            );
          }
        }
      },
      /**
       * When a transformation is reordered
       * It populates 'transformationInEdit'
       * This is used whilst the editor is open
       * It is stored on save, or cleared/discarded if not saved
       * Will not run if there are unsaved changes, unless force option is used
       */
      reorderTransformation(indexToMove, direction, force = false) {
        this.triggerUnsavedChangesWarning();
        if (!this.childHasUnsavedChanges || force === true) {
          const startIndex = indexToMove;

          // up = reduce index, down = increase index
          const toIndex = direction === 'up' ? startIndex - 1 : startIndex + 1;

          // use object.assign, otherwise will reference the actual array in the store
          // which will cause an error if reordered more than once, due to mutating state
          const transformation = Object.assign([], this.transformationInEdit);

          // remove `from` item and store it
          const itemToMove = transformation.splice(startIndex, 1)[0];
          // insert stored item into position `to`
          transformation.splice(toIndex, 0, itemToMove);

          this.transformationInEdit = transformation;

          // ensure selected function isn't changed due to index change

          // if the currently-selected function is being moved, update the selected index
          const selectedIndex = this.selectedFunctionIndex;
          if (selectedIndex === startIndex) {
            this.selectedFunctionIndex = toIndex;
          }
          // if the function is moved into the place of the currently selected function,
          // set selectedFunction to the 'from' position - as will have been swapped to here
          if (selectedIndex === toIndex) {
            this.selectedFunctionIndex = startIndex;
          }
        }
      },
      changeFunctionInTransformation(
        indexForNewFunct,
        newFunct,
        replace = true
      ) {
        // if replace === false, add new function at index (delete 0)
        const deleteCount = replace ? 1 : 0;

        // use object.assign, otherwise will reference the actual array in the store
        // which can cause an error due to mutating state
        const transformation = Object.assign([], this.transformationInEdit);

        if (!newFunct) {
          transformation.splice(indexForNewFunct, deleteCount);
        } else {
          transformation.splice(indexForNewFunct, deleteCount, newFunct);
        }
        this.transformationInEdit = transformation;

        // unset the selectedFunctionIndex, which will unset selectedFunction and close the settings panel
        this.selectedFunctionIndex = null;

        // also unset 'addingNewFunct', as will now be added
        this.addNewFunctionClose();
      },
      /**
       * Save Transformation Edits
       * update the state with newTransformationString
       * cannot call resetAll, instead this is called after all 'on save' functionality done
       */
      saveTransformationEdits() {
        const functionTypesMatch =
          this.functionIndexesWithNonMatchingInputType.length < 1;

        if (functionTypesMatch) {
          this.setNewTransformationString(this.transformationInEditAsString);
          console.log(this.newTransformationString);
          this.setSaveRequested(true);
        } else {
          // show a message and don't save if types don't match
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: 'The input / output types of all selected functions do not match - please check the highlighted functions',
            },
            4000
          );
        }
      },

      // Method-style getters

      /**
       * Checks that two types match
       * Has special handling for 'numeric' type, which matches float OR int
       */
      checkTypesMatch(outputType, inputType) {
        // if either type is null, return true as cannot compare
        if (outputType === null || inputType === null) {
          return true;
        }

        // handle multi-type input string
        const outputTypeArray = outputType.split('|');
        const inputTypeArray = inputType.split('|');

        const numberTypes = ['float', 'integer'];
        // if the generic 'number' type is accepted as input or output, allow any number type
        const outputTypeIncludesNumeric = outputTypeArray.includes('numeric');
        const inputTypeIncludesNumeric = inputTypeArray.includes('numeric');
        if (
          (outputTypeIncludesNumeric &&
            arraysHaveIntersect(inputTypeArray, numberTypes)) ||
          (inputTypeIncludesNumeric &&
            arraysHaveIntersect(outputTypeArray, numberTypes))
        ) {
          return true;
        }

        return arraysHaveIntersect(outputTypeArray, inputTypeArray);
      },

      /**
       * Discard Transformation edits
       * deselect field, transformation, functionIndex
       */
      discardTransformationEdits() {
        this.resetAll();
      },

      /**
       * Sets the transformation back to its original value
       * - just the 'source field' string
       * Or an empty string if this is not set
       */
      clearTransformation() {
        this.setNewTransformationString(this.selectedField.source_field ?? '');
        this.setSaveRequested(true);
      },

      /**
       * Reset all
       * Deselect field, transformation, functionIndex
       * Set SaveRequested to false
       * Set addingNewFunct to false
       * Used when edits are completed (eg due to cancel, save)
       */
      resetAll() {
        this.selectedField = null;
        this.setTransformationInEdit();
        this.setExistingTransformationUnreadable(false);
        this.selectFunctionIndex(null);
        this.setChildHasUnsavedChanges(false);
        this.newTransformationString = '';
        this.setSaveRequested(false);
        this.addNewFunctionClose();
        this.setFieldSourceDestTypeEditable(false, false);
        this.setEditingFieldType(null);
      },

      addNewFunction() {
        this.triggerUnsavedChangesWarning();
        if (!this.childHasUnsavedChanges) {
          this.addingNewFunct = true;
          this.selectFunctionIndex(null);
          this.setEditingFieldType(null);
        }
      },

      addNewFunctionClose() {
        // suppress the warning message, as already handled by selectFunctionIndex and would appear twice
        this.triggerUnsavedChangesWarning(true);
        if (!this.childHasUnsavedChanges) {
          this.addingNewFunct = false;
        }
      },

      storeMapPresets(mapPresets) {
        this.mapPresets = mapPresets;
      },

      addMapPresets(mapPresets) {
        this.mapPresets = this.mapPresets.concat(mapPresets);
      },

      storeSourceSchema(schema) {
        this.sourceSchema = schema;
      },

      functionNameById(scriptId) {
        if (this.functionDefinitionsLoaded) {
          const script = this.getDefinitionById(scriptId);
          return script.attributes.name;
        }
        return '';
      },

      decodeTransformationString(
        transformationString,
        mergeDefinitions = true
      ) {
        // no existing transformation
        if (transformationString === '') {
          return {
            scripts: [],
          };
        }

        // check string is the expected format
        if (!transformationString.includes(this.prefixForMappingFile, 0)) {
          throw new Error('Transformation string is not in supported format');
        }

        // remove the un-needed text and convert to object
        const regexForSelect = '\\:\\:\\((.*)\\)';
        const cleanedString = transformationString.match(regexForSelect)[1];

        const transformationObject = JSON.parse(cleanedString);

        const scriptsObject = transformationObject.scripts || {};
        let transformations = Object.values(scriptsObject);

        if (mergeDefinitions) {
          transformations = transformations.map((transformation) => {
            return this.mergeDefinitionWithTransformation(transformation);
          });
        }
        return Object.assign({}, transformationObject, {
          scripts: transformations,
        });
      },
      /**
       * Returns an array of additional inputs for a given transform string
       */
      getAdditionalInputsFromTransformString(transformString) {
        if (
          !transformString ||
          !transformString.includes(`${this.prefixForMappingFile}`)
        ) {
          return [];
        }

        try {
          const transformation = this.decodeTransformationString(
            transformString,
            false
          );

          const scripts = transformation.scripts;
          if (scripts.length) {
            const additionalInputsPerScript = transformation.scripts.map(
              (script) => {
                const inputs = script.additional_inputs;

                if (Object.keys(inputs).length) {
                  return {
                    scriptName: this.functionNameById(script.script_id),
                    inputName: Object.keys(inputs)[0],
                    selectedField: Object.values(inputs)[0],
                  };
                } else {
                  return [];
                }
              }
            );
            return additionalInputsPerScript.flat();
          }
          return [];
        } catch (e) {
          console.error(e);
          return [];
        }
      },
      /*
       * Converts a given transformation into string format
       * As is saved in the the mapping file
       * Optionally pass in a field to use, otherwise selectedField from state is used
       * Object.assign is used to prevent modification of the original transformation arrays / objects
       */
      createTransformationString(scriptsArray, field = null) {
        const transformationArray = Object.assign([], scriptsArray);

        const keyedScripts = {};
        transformationArray.forEach((funct, index) => {
          const newFunct = Object.assign({}, funct);
          delete newFunct.name;
          delete newFunct.definition;

          const key = index + 1;
          keyedScripts[key] = newFunct;
        });

        const fieldForString = field || this.selectedField;

        const formatForMapping = {
          // input_key is not required for all functions - will be absent if empty
          input_key: fieldForString?.source_field,
          // if no input_key, source_type should be null.  Otherwise, use the specified type
          source_type: fieldForString?.source_field
            ? fieldForString?.source_type
            : null,
          destination_type: fieldForString?.destination_type,
          scripts: keyedScripts,
        };

        const stringForMapping = JSON.stringify(formatForMapping);

        return `${this.prefixForMappingFile}(${stringForMapping})`;
      },
      /**
       * Allows non-type-matching functions to be checked on the fly
       * Used by functionIndexesWithNonMatchingTypes - this getter was added to avoid changing the type of the original
       */
      computeFunctionIndexesWithNonMatchingInputType(
        currentTransformation,
        currentField
      ) {
        const nonMatchingIndexes = currentTransformation.map((funct, index) => {
          if (!funct.definition) {
            funct = this.mergeDefinitionWithTransformation(funct);
          }
          const inputType = funct.definition.input.type ?? null;
          let outputTypeOfPrevious = null;

          if (index === 0) {
            // is first function - use source type
            outputTypeOfPrevious = currentField.source_type;
          } else {
            const prevFunctIndex = index - 1;
            const prevFunction = currentTransformation[prevFunctIndex];
            outputTypeOfPrevious = prevFunction.definition.output.type ?? null;
          }

          const matches = this.checkTypesMatch(outputTypeOfPrevious, inputType);
          return matches ? null : index;
        });

        // check destination type
        // only run if actually has functions in the transformation
        const transformationLength = currentTransformation.length;
        if (transformationLength > 0) {
          const lastFunct = currentTransformation[transformationLength - 1];
          const lastFunctOutputType = lastFunct.definition.output.type ?? null;
          const destinationTypeMatches = this.checkTypesMatch(
            lastFunctOutputType,
            currentField.destination_type
          );

          if (!destinationTypeMatches) {
            nonMatchingIndexes.push('destination');
          }
        }

        return nonMatchingIndexes.filter((item) => item !== null);
      },
    },
  }
);
