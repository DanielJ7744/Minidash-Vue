<template>
  <div
    v-if="!scriptsLoading && !existingTransformationUnreadable"
    class="grid-sidebar-footer"
  >
    <div class="grid-sidebar-footer__sidebar">
      <PageServicesMappingTransformationsFunctionsOrganiser
        v-if="field"
        :field="field"
      />
    </div>

    <PageServicesMappingTransformationsFunctionSettings
      v-if="selectedFunction"
      :key="functionIndex"
      class="grid-sidebar-footer__main"
    />

    <PageServicesMappingTransformationsDataTypeSettings
      v-else-if="showTypeEditor"
    />
    <div v-else class="flex items-center justify-center gap-x-2">
      <span class="icon icon--cog" />
      <span>Select a function to edit</span>
    </div>
    <div
      v-if="!selectedFunction"
      class="grid-sidebar-footer__footer flex flex-col-reverse justify-end md:flex-row"
    >
      <button
        class="button button-secondary"
        @click="cancelTransformationChanges"
      >
        Cancel
      </button>
      <button class="button button-secondary" @click="deleteTransformation">
        Delete Transformation
      </button>
      <button
        class="button button-primary"
        :disabled="childHasUnsavedChanges || transformationInEditLength < 1"
        @click="saveTransformationChanges"
      >
        Save Transformation
      </button>
    </div>
  </div>

  <div v-else-if="!scriptsLoading && existingTransformationUnreadable">
    <UiMessage
      type="fail"
      icon="warning"
      header="Could not read existing transformation"
    >
      <template>
        <p>
          The existing transformation could not be read - this may be because it
          is in an old or invalid format.
        </p>
        <p>
          If you proceed, the existing transformation will be discarded, but you
          may be able to recreate the transformation using the supplied
          functions. The existing transformation will not be overwritten until
          you save your changes.
        </p>
        <br />
        <p>The original transformation value is:</p>
        <pre v-if="field"> {{ field.transformation }} </pre>
        <p>
          Alternatively, click 'Cancel' to exit and leave the existing
          transformation unchanged.
        </p>
      </template>
      <template #buttons>
        <div class="flex justify-around">
          <button
            class="button button-secondary"
            @click="cancelTransformationChanges"
          >
            Cancel
          </button>
          <button
            class="button button-danger"
            @click="discardUnreadableTransformation"
          >
            Discard Existing Transformation
          </button>
        </div>
      </template>
    </UiMessage>
  </div>

  <UiLoading v-else />
</template>

<script>
import { mapActions, mapState } from 'pinia';

export default {
  name: 'TransformationEditor',
  computed: {
    ...mapState(useMappingTransformationsStore, {
      field: 'selectedField',
      editingSourceOrDestination: 'editingFieldType',
      childHasUnsavedChanges: 'childHasUnsavedChanges',
      existingTransformationUnreadable: 'existingTransformationUnreadable',
      functionIndex: 'selectedFunctionIndex',
      functionDefinitionsLoaded: 'functionDefinitionsLoaded',
      selectedFunction: 'selectedFunction',
      transformationInEditLength: 'transformationInEditLength',
    }),
    scriptsLoading() {
      return !this.functionDefinitionsLoaded;
    },
    showTypeEditor() {
      return (
        this.editingSourceOrDestination === 'source' ||
        this.editingSourceOrDestination === 'destination'
      );
    },
  },
  methods: {
    ...mapActions(useMappingTransformationsStore, [
      'discardTransformationEdits',
      'saveTransformationEdits',
      'clearTransformation',
      'setExistingTransformationUnreadable',
    ]),
    ...mapActions(useUiStore, ['closeModal']),
    /**
     * Cancel changes
     * Clears the selections for field, transformation etc
     * And closes the modal
     * Nb, the parent may also want to call discardTransformationEdits in response to onModalClose event
     * eg to catch the modal being closed with the 'x' instead of cancel button
     * This will result in discardTransformationEdits running twice via this method, but this is not a problem
     */
    cancelTransformationChanges() {
      this.discardTransformationEdits();
      this.closeModal();
    },
    saveTransformationChanges() {
      this.saveTransformationEdits();
    },
    deleteTransformation() {
      const confirmed = window.confirm(
        'Are you sure you want to delete this entire transformation?'
      );
      if (confirmed) {
        this.clearTransformation();
      }
    },
    discardUnreadableTransformation() {
      this.setExistingTransformationUnreadable(false);
    },
  },
};
</script>

<style scoped lang="scss">
.grid-sidebar-footer {
  display: grid;
  grid-gap: 15px;
  grid-template-areas:
    'sidebar main'
    'footer footer';
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  grid-template-rows: 1fr auto;
  height: 100%;

  & > * {
    overflow: auto;
  }

  &__footer {
    border-top: 1px solid #e3e3e3;
    grid-area: footer;
    padding-top: 20px;
    overflow: visible;
  }

  @media screen and (max-width: 48em) {
    grid-template-areas:
      'sidebar'
      'main'
      'footer';
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(150px, 1fr) 2fr auto;

    &__sidebar {
      border-bottom: 1px solid #e3e3e3;
    }
  }

  .card {
    margin: 0;
  }
}
</style>
