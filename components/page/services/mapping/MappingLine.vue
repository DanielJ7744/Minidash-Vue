<template>
  <UiAccordian
    :expand-by-default="mappingRow.shouldExpandAndEdit"
    class="mb-1"
    :class="[
      borderClass,
      {
        'field-mapping-line--has-transform-button':
          editing && showTransformButton,
      },
    ]"
    @toggled="onToggle"
  >
    <!-- Accordian header -->
    <template #header>
      <div class="grid w-full grid-cols-3">
        <div class="flex w-full flex-nowrap items-center overflow-hidden">
          <div v-if="getIconToShow(mappingRow, 'from')" class="mr-2">
            <span
              class="icon text-xs"
              :class="getIconToShow(mappingRow, 'from')"
            />
          </div>

          {{ displayTextFromMapping }}
        </div>

        <div class="flex items-center justify-center">
          <span
            v-if="transformFunctionCountConfirmed > 0"
            class="icon icon--magic-wand rounded-full border p-2"
          />
          <span
            v-else
            class="icon icon--arrow-right z-10 rounded-full border p-2"
          />
        </div>

        <div class="flex justify-between">
          <div class="flex w-full flex-nowrap items-center overflow-hidden">
            <div v-if="getIconToShow(mappingRow, 'to')" class="mr-2">
              <span
                class="icon text-sm"
                :class="getIconToShow(mappingRow, 'to')"
              />
            </div>

            {{ displayTextToMapping }}
          </div>

          <div v-if="!bothSidesLocked" class="mr-0.5 flex gap-1">
            <button
              v-if="!editing && !editingSource && expanded && !readOnlyMode"
              class="button button-secondary button-sm md:mt-0"
              @click.stop="
                beginEdit(!mappingRow.from_locked && mappingRow.to_locked)
              "
            >
              Edit
            </button>
            <button
              v-if="editing || editingSource"
              class="button button-secondary button-sm"
              @click.stop="cancelEdit()"
            >
              Cancel
            </button>
            <button
              v-if="editing || editingSource"
              class="button button-primary button-sm"
              @click.stop="endEdit()"
            >
              Done
            </button>
            <button
              v-if="shouldAllowDelete"
              class="button button-secondary button-sm"
              @click.stop="deleteMappingRow()"
            >
              <span class="icon icon--bin" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Accordion body -->
    <div>
      <div
        v-if="bothSidesLocked"
        class="field-mapping-line__body px-4 pt-2 text-gray-400"
      >
        This field is required by Patchworks and cannot be edited or removed.
      </div>

      <div v-if="errors.length > 0" class="px-4 pt-2 text-red-400">
        <span class="font-medium">Unable to save mapping row:</span>
        <ul class="list-inside list-disc">
          <li v-for="(error, index) in errors" :key="index">
            {{ error }}
          </li>
        </ul>
      </div>

      <div
        :class="{ 'scrollbar-hidden overflow-x-auto': !selectOpened }"
        class="field-mapping-line__body"
      >
        <PageServicesMappingOrderableCard
          v-if="!editing && !editingSource"
          controls-type="none"
          class="field-mapping-line__source_field flex-1"
        >
          <template #header>
            {{ displayPathFromMapping }}
          </template>
          <template #body>
            {{
              displayTextFromMapping && displayTextFromMapping.length
                ? displayTextFromMapping
                : '[No source selected]'
            }}
          </template>
        </PageServicesMappingOrderableCard>

        <div
          v-else
          class="flex flex-1 shrink-0 flex-col gap-4 rounded-sm border p-4 shadow-lg"
        >
          <FormElement title="source_field" label="Source Field">
            <PageServicesMappingFieldSelect
              v-model="mutableFromMappingElement.metadata.path"
              :options="fromSchema ? fromSchema : []"
              class="w-full"
              @show="fieldOpened"
            />
          </FormElement>

          <FormElement
            v-model="mutableFromMappingElement.pw_field_name"
            v-slot="{ inputProps, inputEvents }"
            title="source_display_name"
            label="Display Name (optional)"
          >
            <input v-bind="inputProps" v-on="inputEvents" type="text" />
          </FormElement>
        </div>

        <div class="field-mapping-line__connecting-arrow text-center">
          <PageServicesMappingTransformationsEditButton
            v-if="canShowTransform"
            v-model="mutableToMappingElement.pw_value"
            class="field-mapping-line__transform-button"
            :class="{
              'field-mapping-line__transform-button--warning':
                transformationErrors.length,
            }"
            :line-id="mappingRow.rowId"
            :input-key-fallback="
              getFromField(mutableFromMappingElement.metadata.path)
            "
            :source-type-editable="!!mutableFromMappingElement.metadata.path"
            :destination-type-editable="true"
            :source-data-type="
              mutableFromMappingElement.metadata.path
                ? mutableFromMappingElement.pw_field_type
                : 'none'
            "
            :destination-data-type="mutableToMappingElement.pw_field_type"
            :source-data="mutableFromMappingElement"
            @field-data-type-updated="onTransformDataTypeUpdate($event)"
            @transformation-errors="onTransformationErrors($event)"
          />
        </div>

        <PageServicesMappingOrderableCard
          v-if="!editing"
          controls-type="none"
          class="field-mapping-line__dest-field flex-1"
        >
          <template #header>
            {{ displayPathToMapping }}
          </template>
          <template #body>
            {{ displayTextToMapping ? displayTextToMapping : '&nbsp;' }}
          </template>
        </PageServicesMappingOrderableCard>

        <div
          v-else
          class="field-mapping-line__fields--detail grid flex-1 shrink-0 grid-cols-1 gap-4 rounded-sm border p-4 shadow-lg"
        >
          <FormElement title="destination_field" label="Destination Field">
            <PageServicesMappingFieldSelect
              class="w-full"
              v-model="mutableToMappingElement.metadata.path"
              :options="toSchema ? toSchema : []"
              @show="fieldOpened"
            />
          </FormElement>

          <FormElement
            v-model="mutableToMappingElement.pw_field_name"
            v-slot="{ inputProps, inputEvents }"
            title="destination_display_name"
            label="Display Name (optional)"
          >
            <input v-bind="inputProps" v-on="inputEvents" type="text" />
          </FormElement>
        </div>
      </div>

      <div v-if="debug" class="grid grid-cols-2">
        <pre class="overflow-auto">{{
          mutableFromMappingElement | pretty
        }}</pre>
        <pre class="overflow-auto">{{ mutableToMappingElement | pretty }}</pre>
      </div>
    </div>
  </UiAccordian>
</template>

<script>
import { mapActions, mapState } from 'pinia';
import clone from 'just-clone';

export default {
  name: 'MappingLine',
  filters: {
    pretty(value) {
      return JSON.stringify(value, null, 2);
    },
  },
  props: {
    mappingRow: {
      type: Object,
      default: () => {
        return {};
      },
    },
    debug: {
      type: Boolean,
      default: false,
    },
    fromSchema: {
      type: Array,
      default: () => {
        return [];
      },
    },
    toSchema: {
      type: Array,
      default: () => {
        return [];
      },
    },
    showTransformButton: {
      type: Boolean,
      default: false,
    },
    readOnlyMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      id: null,
      editing: false,
      editingSource: false,
      expanded: false,
      transformFunctionCountConfirmed: 0,
      mutableFromMappingElement: {},
      mutableToMappingElement: {},
      errors: [],
      transformationErrors: [],
      selectOpened: false,
      fromSideOnly: false,
    };
  },
  computed: {
    ...mapState(useMappingTransformationsStore, {
      transformStringPrefix: 'prefixForMappingFile',
    }),
    transformFunctionCountInEdit() {
      const transformString = this.mutableToMappingElement.pw_value;
      // don't try to decode if isn't a transform string
      if (
        transformString &&
        transformString.includes(this.transformStringPrefix)
      ) {
        try {
          return this.decodeTransformation(transformString, false).scripts
            .length;
        } catch {
          return 0;
        }
      }
      return 0;
    },
    hasChanges() {
      return this.mappingRow.edited ?? false;
    },
    displayTextFromMapping() {
      const fieldName = this.mutableFromMappingElement.pw_field_name;
      const fieldNameIsFilled = fieldName && fieldName !== '';
      return fieldNameIsFilled
        ? fieldName
        : this.mutableFromMappingElement.metadata?.path;
    },
    displayTextToMapping() {
      const fieldName = this.mutableToMappingElement.pw_field_name;
      const fieldNameIsFilled = fieldName && fieldName !== '';
      return fieldNameIsFilled
        ? fieldName
        : this.mutableToMappingElement.metadata?.path;
    },
    displayPathFromMapping() {
      return this.mutableFromMappingElement.metadata?.path ?? 'Field';
    },
    displayPathToMapping() {
      return this.mutableToMappingElement.metadata?.path ?? 'Field';
    },
    borderClass() {
      if (this.errors.length > 0) {
        return 'border border-red-500';
      }
      if (this.hasChanges && !this.editing) {
        return 'border border-orange-500';
      }
      if (this.editing) {
        return 'border border-primary-500';
      }
      return '';
    },
    additionalInputs() {
      return this.additionalInputsForTransform(
        this.mutableToMappingElement.pw_value
      );
    },
    /**
     * Source is not required if a transform is set
     * The transform UI validates that only certain transforms can be set with no source
     */
    sourceIsRequired() {
      return this.transformFunctionCountInEdit < 1;
    },
    rowHasLockedOrRequiredSide() {
      return (
        this.mappingRow.to_locked ||
        this.mappingRow.to_required ||
        this.mappingRow.from_locked ||
        this.mappingRow.from_required
      );
    },
    shouldAllowDelete() {
      return (
        !this.bothSidesLocked &&
        !this.rowHasLockedOrRequiredSide &&
        (this.editing || this.editingSource)
      );
    },
    bothSidesLocked() {
      return (
        (this.mappingRow.from_locked ?? false) &&
        (this.mappingRow.to_locked ?? false)
      );
    },
    canShowTransform() {
      return (
        (this.editing || this.editingSource) &&
        !this.bothSidesLocked &&
        this.showTransformButton
      );
    },
  },
  watch: {
    mappingRow() {
      this.reset();
    },
    editing: {
      handler() {
        this.$emit('edit-status-change', {
          rowId: this.mappingRow.rowId,
          editing: this.editing,
        });
      },
      immediate: true,
    },
    editingSource: {
      handler() {
        this.$emit('edit-status-change', {
          rowId: this.mappingRow.rowId,
          editing: this.editingSource,
        });
      },
      immediate: true,
    },
  },
  mounted() {
    this.reset();
    if (this.mappingRow.shouldExpandAndEdit) {
      this.beginEdit();
    }

    // set the (current) function count on load
    const transformString = this.mutableToMappingElement.pw_value;
    // don't try to decode if isn't a transform string
    if (
      transformString &&
      transformString.includes(this.transformStringPrefix)
    ) {
      try {
        this.transformFunctionCountConfirmed = this.decodeTransformation(
          transformString,
          false
        ).scripts.length;
      } catch {
        this.transformFunctionCountConfirmed = 0;
      }
    }
  },
  methods: {
    ...mapActions(useMappingTransformationsStore, {
      decodeTransformation: 'decodeTransformationString',
      additionalInputsForTransform: 'getAdditionalInputsFromTransformString',
    }),
    getIconToShow(mappingRow, side) {
      if (side === 'to') {
        if (mappingRow.to_locked) {
          return 'icon--lock';
        }
        if (mappingRow.to_required) {
          return 'icon--asterisk text-danger-500';
        }
      }
      if (side === 'from') {
        if (mappingRow.from_locked) {
          return 'icon--lock';
        }
        if (
          mappingRow.to_locked ||
          mappingRow.to_required ||
          mappingRow.from_required
        ) {
          return 'icon--asterisk text-danger-500';
        }
        if (
          !Object.keys(mappingRow.from).length &&
          (mappingRow.to_locked || mappingRow.to_required)
        ) {
          return 'icon--asterisk text-danger-500';
        }
      }
      return null;
    },
    beginEdit(fromSideOnly = false) {
      this.expanded = true;
      if (fromSideOnly) {
        this.fromSideOnly = true;
        this.editingSource = true;
        return;
      }
      this.editing = true;
    },
    cancelEdit() {
      this.editingSource = false;
      this.editing = false;
      this.reset();

      // auto-delete an empty row on close
      // note: if user types something in a new row, then cancels, row is still deleted
      // because the row has no saved data, cancel and not-delete would leave a blank row
      if (this.mappingRow.isNew && this.mappingRow.isNew === true) {
        this.deleteMappingRow(true);
      }
    },
    getFromField(rowPath) {
      if (!rowPath) {
        return '';
      }
      return rowPath.split('.0.').pop();
    },
    endEdit() {
      const errors = this.validate();
      if (errors.length === 0 || this.debug) {
        this.errors = [];
        this.editing = false;
        this.editingSource = false;

        // index and pw_value
        this.mutableFromMappingElement.metadata.index =
          this.mutableFromMappingElement.metadata.path?.split('.').pop();
        this.mutableToMappingElement.metadata.index =
          this.mutableToMappingElement.metadata.path.split('.').pop();

        const fromField = this.getFromField(
          this.mutableFromMappingElement.metadata.path
        );
        this.mutableFromMappingElement.pw_value = fromField;

        // set the 'to' pw_value, which is the path after any 'multiple' section
        // unless a transform/function has been applied
        if (!this.mutableToMappingElement.pw_value.includes('::')) {
          this.mutableToMappingElement.pw_value = fromField;
        }

        // multiples_of
        this.mutableFromMappingElement.metadata.multiples_of =
          this.mutableFromMappingElement.metadata.path
            ?.split('.0.')
            .slice(0, -1);
        this.mutableToMappingElement.metadata.multiples_of =
          this.mutableFromMappingElement.metadata.multiples_of;

        // rowId
        this.mutableFromMappingElement.pw_row_id = this.mappingRow.rowId;
        this.mutableToMappingElement.pw_row_id = this.mappingRow.rowId;

        const mappingRowClone = clone(this.mappingRow);
        if (mappingRowClone.isNew) {
          mappingRowClone.isNew = false;
          mappingRowClone.isNewRow = true;
        }

        this.$emit('row-updated', {
          ...mappingRowClone,
          from: this.mutableFromMappingElement,
          to: this.mutableToMappingElement,
          additionalInputs: this.additionalInputs,
          edited: true,
        });

        // update the function count
        this.transformFunctionCountConfirmed =
          this.transformFunctionCountInEdit;
      } else {
        this.errors = errors;
      }
    },
    validate() {
      const errors = new Set();
      if (this.transformationErrors?.length) {
        this.transformationErrors.forEach((error) => errors.add(error));
      }
      if (this.bothSidesLocked) {
        errors.add(
          'This row is locked because it is required by the Patchworks Platform'
        );
      }
      const validationObject = {
        mutableToMappingElement: 'Destination',
      };

      // source is conditionally required
      if (this.sourceIsRequired) {
        Object.assign(validationObject, {
          mutableFromMappingElement: 'Source',
        });
      }

      for (const mapElementName in validationObject) {
        const requiredFields = ['metadata.path'];

        for (const key of requiredFields) {
          // handle nested fields with a split & join as separate key
          const [topLevel, ...nested] = key.split('.');

          if (!this[mapElementName][topLevel][nested.join('.')]) {
            errors.add(
              `Missing a required field: ${validationObject[mapElementName]}`
            );
          }
        }
      }
      return [...errors];
    },
    reset() {
      this.mutableFromMappingElement = clone(this.mappingRow.from);
      if (!('metadata' in this.mutableFromMappingElement)) {
        this.mutableFromMappingElement.metadata = {};
        this.mutableFromMappingElement.metadata.path = '';
      }
      this.mutableToMappingElement = clone(this.mappingRow.to);
    },
    onToggle(shouldExpand) {
      this.expanded = shouldExpand;
    },
    fieldOpened() {
      this.selectOpened = true;
    },
    deleteMappingRow(skipConfirm = false) {
      if (skipConfirm || confirm('Are you sure you want to delete this row?')) {
        // emit event to mark as not in-edit, before row is deleted
        this.$emit('edit-status-change', {
          rowId: this.mappingRow.rowId,
          editing: false,
        });
        this.$emit('row-deleted', this.mappingRow);
      }
    },

    /**
     * Update the 'field type' values in the mapping
     * When they are changed in the transformation
     * Transformation values take precedence, but this keeps the mapping in-sync
     */
    onTransformDataTypeUpdate(event) {
      const newSourceType = event.source_type;
      const newDestinationType = event.destination_type;

      if (newSourceType) {
        this.mutableFromMappingElement.pw_field_type = newSourceType;
      }
      if (newDestinationType) {
        this.mutableToMappingElement.pw_field_type = newDestinationType;
      }
    },
    sourceValueSelected(event) {
      this.$emit('edit-status-change', {
        rowId: this.mappingRow.rowId,
        editing: this.fromSideOnly ? this.editingSource : this.editing,
        path: event,
      });
    },

    /**
     * Transform errors emitted if a change makes the transformation invalid
     * And cleared on transform save
     * On validate, checks transformationErrors to decide if can save
     */
    onTransformationErrors(errors) {
      this.transformationErrors = errors;
    },
  },
};
</script>

<style scoped lang="scss">
.field-mapping-line {
  &__header {
    display: grid;
    grid-template-columns:
      [from] minmax(0, 1fr)
      [middle] 200px
      [to] minmax(0, 1fr);
    width: 100%;
    justify-content: center;
    align-items: center;
    @media screen and (max-width: 48em) {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
    }
  }

  &__header-column {
    @apply text-base;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    @media screen and (max-width: 48em) {
      @apply text-sm;
      display: block;
      width: 100%;
    }
  }

  &__header-buttons {
    margin-left: auto;
    justify-content: flex-end;
  }

  &__body {
    @apply w-full space-y-3 md:justify-between lg:flex lg:space-y-0;

    align-items: center;
    padding: 10px 38px 10px 10px;

    @media screen and (max-width: 48em) {
      padding-right: 10px;
      justify-content: flex-start;
    }
  }

  &__transform-button {
    margin: 0 20px;
    z-index: 1;

    &--warning {
      border-color: #e17f2e;

      .icon {
        &before {
          // display: block;
          /* use !important to prevent issues with browser extensions that change fonts */
          font-family: 'icomoon' !important;
          speak: none;
          font-style: normal;
          font-weight: normal;
          font-variant: normal;
          text-transform: none;
          line-height: 1;
          // margin-right: 5px;
          /* Better Font Rendering =========== */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          content: '\e91c';

          display: inline;
          color: #e17f2e;
          margin: 0;
        }
      }
    }
  }

  &__source-field {
    grid-column: from;
  }

  &--locked {
    .field-mapping-line__header-column {
      &before {
        /* use !important to prevent issues with browser extensions that change fonts */
        font-family: 'icomoon' !important;
        speak: none;
        font-style: normal;
        font-weight: normal;
        font-variant: normal;
        text-transform: none;
        line-height: 1;
        margin-right: 5px;
        /* Better Font Rendering =========== */
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        content: '\e920';

        display: flex;
        align-items: center;
      }
    }
  }

  &--h-big {
    height: 400px;
  }

  &__connecting-arrow {
    @apply flex-1;
    $color: #999999;

    position: relative;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    grid-column: middle;
    grid-row: 1;

    &:before,
    &:after {
      @apply hidden lg:block;
      position: absolute;
      top: 50%;
      content: '';
      z-index: 0;
    }

    &:before {
      left: 0;
      right: 0;
      width: 100%;
      height: 0;
      border-top: 2px dashed $color;
    }

    &:after {
      top: calc(50% - 4px);
      right: -1px;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 5px 0 5px 8.7px;
      border-color: transparent transparent transparent $color;
    }

    @media screen and (max-width: 48em) {
      min-width: 200px;
    }

    &--secondary {
      grid-row: auto;

      &:before {
        top: -50%;
        width: 52%;
        height: 111%;
        border-top: none;
        border-bottom: 2px dashed $color;
        border-right: 2px dashed $color;
        border-bottom-right-radius: 5px;
      }

      &:after {
        display: none;
      }
    }
  }

  &--has-transform-button {
    .field-mapping-line__connecting-arrow--secondary {
      &:before {
        top: -105%;
        height: 150%;
      }
    }
  }
}
</style>
