<template>
  <ul class="process-list">
    <li class="process-list__item process-list__item--start">
      <PageServicesMappingOrderableCard
        class="process-list__item-content"
        :class="{
          'border-gray-600': editingSourceOrDestination === 'source',
        }"
        :controls-type="controlIconStart"
        :hide-body="true"
        @orderable-card-cog-button="openSourceTypeSettings"
      >
        <template #header>
          <span class="text-xs">Data Type: {{ sourceType }}</span>
        </template>
      </PageServicesMappingOrderableCard>
    </li>

    <li
      v-for="(funct, index) in transformation"
      :key="index"
      class="process-list__item"
    >
      <PageServicesMappingTransformationsFunctionsOrganiserFunction
        :function-index="index"
        :function="funct"
        :is-first-item="index === 0"
        :is-last-item="isLastItem(index)"
        class="process-list__item-content"
        @reorder-function="changeFunctionOrder($event, index)"
      />
    </li>

    <li class="process-list__item process-list__item--empty">
      <PageServicesMappingOrderableCard
        class="process-list__item-content border-dashed border-2 flex justify-center cursor-pointer"
        :class="{ 'border-gray-600': addNewSelected }"
        hide-header
        @click="addNewFunction"
      >
        <template #body>
          <div class="flex items-center gap-x-2 p-2">
            <span class="icon icon--add" />
            <span class="text-sm">Add new function</span>
          </div>
        </template>
      </PageServicesMappingOrderableCard>
    </li>

    <li class="process-list__item process-list__item--finish">
      <PageServicesMappingOrderableCard
        class="process-list__item-content"
        :class="{
          'border-gray-600':
            editingSourceOrDestination === 'destination',
          'border-danger-600': !destinationTypeMatches,
        }"
        :controls-type="controlIconEnd"
        :hide-body="true"
        @orderable-card-cog-button="openDestinationTypeSettings"
      >
        <template #header>
          <span class="text-xs">Data Type: {{ destinationType }}</span>
        </template>
      </PageServicesMappingOrderableCard>
    </li>
  </ul>
</template>

<script>
import { mapActions, mapState } from 'pinia';

export default {
  name: 'FunctionsOrganiser',
  props: {
    field: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapState(useMappingTransformationsStore, {
      transformation: 'transformationInEdit',
      addNewSelected: 'addingNewFunct',
      sourceTypeEditable: 'fieldSourceTypeEditable',
      destinationTypeEditable: 'fieldDestinationTypeEditable',
      editingSourceOrDestination: 'editingFieldType',
      typeMatchFails: 'functionIndexesWithNonMatchingInputType',
    }),

    sourceType() {
      if (this.field.source_type === 'none') {
        return '[No Source Selected]';
      }
      return this.field.source_type;
    },
    destinationType() {
      return this.field.destination_type;
    },
    controlIconStart() {
      if (this.sourceTypeEditable) {
        return 'cog';
      }
      return '';
    },
    controlIconEnd() {
      if (this.destinationTypeEditable) {
        return 'cog';
      }
      return '';
    },
    destinationTypeMatches() {
      return !this.typeMatchFails.includes('destination');
    },
  },
  methods: {
    ...mapActions(useMappingTransformationsStore, {
      reorderTransformation: 'reorderTransformation',
      addNewFunction: 'addNewFunction',
      setEditingFieldType: 'setEditingFieldType',
    }),

    openSourceTypeSettings() {
      this.setEditingFieldType('source');
    },

    openDestinationTypeSettings() {
      this.setEditingFieldType('destination');
    },

    changeFunctionOrder(event, keyToMove) {
      const startIndex = keyToMove;
      const direction = event.direction;
      this.reorderTransformation(startIndex, direction);
    },

    isLastItem(key) {
      return key === this.transformation.length - 1;
    },
  },
};
</script>

<style scoped lang="scss">
.process-list {
  $counter-size: 16px;
  $border-thickness: 3px;
  $counter-position-adjust: $border-thickness * 2 - $counter-size;

  border-left: $border-thickness solid #e3e3e3;
  list-style-type: none;
  padding-left: 0;
  padding-right: 20px;
  margin-left: 10px; //create space for numbering
  counter-reset: process-list;

  &__item {
    margin-left: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    color: #777;

    &:before {
      @apply text-xs;
      color: #212325;
      flex-shrink: 0;
      counter-increment: process-list;
      content: counter(process-list);
      border-radius: 100%;
      border: $border-thickness solid #e3e3e3;
      width: $counter-size;
      height: $counter-size;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      margin-left: $counter-position-adjust;
      background-color: white;
      font-weight: bold;
    }
  }

  &__item--start {
    &:before {
      @apply text-xs;
      counter-increment: none;
      content: 'A';
    }
  }

  &__item--finish {
    margin-bottom: 0;
    align-items: flex-end;

    &:before {
      @apply text-xs;
      counter-increment: none;
      content: 'Z';
    }
  }

  &__item--empty {
    &:before {
      counter-increment: none;
      content: '';
    }
  }

  &__item-content {
    margin-left: 20px;
    width: 100%;
  }
}
</style>
