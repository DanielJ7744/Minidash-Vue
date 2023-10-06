<template>
  <PageServicesMappingOrderableCard
    :class="{'border border-gray-600': isSelected, 'border border-danger-600': typeMatchFail}"
    :disable-down-arrow="isLastItem"
    :disable-up-arrow="isFirstItem"
    @orderable-card-up-button="moveFunctionUp"
    @orderable-card-down-button="moveFunctionDown"
  >
    <template #header>
      <span class="text-xs">
        Function
      </span>
    </template>
    <template #body>
      <div class="w-full text-xs cursor-pointer" @click="openFunctionSettings">
        {{ functionName }}
      </div>
    </template>
  </PageServicesMappingOrderableCard>
</template>

<script>
import { mapActions, mapState } from 'pinia';

export default {
  name: 'FunctionsOrganiserFunction',

  props: {
    functionIndex: {
      required: true,
      type: Number
    },
    function: {
      required: true,
      type: Object
    },
    isFirstItem: {
      type: Boolean,
      required: false,
      default: false
    },
    isLastItem: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    ...mapState(useMappingTransformationsStore, [
      'functionDefinitionsLoaded',
      'selectedFunction',
      'functionIndexesWithNonMatchingInputType'
    ]),
    ...mapState(useMappingTransformationsStore, {
      selectedFunctionIndex: 'selectedFunctionIndex'
    }),

    functionId() {
      return this.function.script_id;
    },

    functionDefinition() {
      return this.function.definition;
    },

    functionName() {
      return this.function.name;
    },

    isSelected() {
      return this.selectedFunctionIndex !== null && (this.functionIndex === this.selectedFunctionIndex);
    },

    typeMatchFail() {
      return this.functionIndexesWithNonMatchingInputType.includes(this.functionIndex);
    }
  },
  methods: {
    ...mapActions(useMappingTransformationsStore, {
      selectFunction: 'selectFunctionIndex',
      functionNameById: 'functionNameById'
    }),

    moveFunctionUp() {
      this.$emit('reorder-function', {
        direction: 'up'
      });
    },

    moveFunctionDown() {
      this.$emit('reorder-function', {
        direction: 'down'
      });
    },

    openFunctionSettings() {
      this.selectFunction(this.functionIndex);
    }
  }
};
</script>
