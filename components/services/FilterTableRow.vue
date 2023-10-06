<template>
  <div
    class="w-full border-b border-gray-300 sm:border-0 pb-4 sm:pb-0 mb-4 md:mb-1"
  >
    <div
      class="flex w-full sm:space-x-1 flex-col sm:flex-row gap-1 sm:gap-0"
    >
      <div class="flex-1 flex gap-4 items-center">
        <h6 class="block sm:hidden w-5/12 text-sm m-0">Field</h6>
        <select
          v-model="selectedField"
          class="w-full h-12 bg-white"
          @change="selectedFieldChanged()"
        >
          <option
            v-for="filterField in filterFields"
            :key="filterField.id"
            :value="filterField"
            class="service-filters-table__cell"
          >
            {{ filterField.name }}
          </option>
        </select>
      </div>
      <div class="flex-1 flex gap-4 items-center">
        <h6 class="block sm:hidden w-5/12 text-sm m-0">Type</h6>
        <select
          v-model="selectedType"
          class="w-full h-12 bg-white"
          :disabled="selectedField === null"
          @change="selectedTypeChanged()"
        >
          <option
            v-for="filterType in filterTypesFormatted"
            :key="filterType.id"
            :value="filterType"
          >
            {{ filterType.name }}
          </option>
        </select>
      </div>
      <div class="flex-1 flex gap-4 items-center">
        <h6 class="block sm:hidden w-5/12 text-sm m-0">
          Operator
        </h6>
        <select
          v-model="selectedOperator"
          class="w-full h-12 bg-white"
          :disabled="selectedType === null"
          @change="selectedOperatorChanged()"
        >
          <option
            v-for="filterOperator in filterOperators"
            :key="filterOperator.id"
            :value="filterOperator"
          >
            {{ filterOperator.name }}
          </option>
        </select>
      </div>
      <div class="flex-1 flex gap-4 items-center">
        <h6 class="block sm:hidden w-5/12 text-sm m-0">Value</h6>
        <input
          type="text"
          v-model="input"
          class="w-full h-12"
          :disabled="!selectedField || !selectedOperator || !selectedType"
          :placeholder="placeholder"
          @change="inputChanged()"
        />
      </div>
      <div
        class="flex items-center justify-end w-10 self-end sm:self-auto mt-2 sm:mt-0"
      >
        <span
          class="service-filters-table__remove-row icon icon--cross"
          @click="removeFilterRow"
        />
      </div>
    </div>
  </div>
</template>

<script>
import strtotime from 'locutus/php/datetime/strtotime';

export default {
  name: 'FilterTableRow',
  props: {
    selectedFilterId: {
      type: String,
      required: false,
      default: null,
    },
    selectedFilterValue: {
      type: String,
      required: false,
      default: null,
    },
    selectedFilterField: {
      type: Object,
      required: false,
      default: null,
    },
    selectedFilterType: {
      type: Object,
      required: false,
      default: null,
    },
    selectedFilterOperator: {
      type: Object,
      required: false,
      default: null,
    },
    filterFields: {
      type: Array,
      required: false,
      default: null,
    },
    filterTypes: {
      type: Array,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      selectedField: this.selectedFilterField,
      selectedType: this.selectedFilterType,
      selectedOperator: this.selectedFilterOperator,
      input: String(this.selectedFilterValue) ?? null,
      error: {
        filterId: this.selectedFilterId,
        hasError: false,
        message: '',
      },
    };
  },
  computed: {
    filterOperators() {
      return (
        this.selectedFilterField?.filter_operators ??
        this.selectedFilterType?.filter_operators ??
        []
      );
    },
    hasRequiredData() {
      return (
        this.selectedField !== null &&
        this.selectedType !== null &&
        this.selectedOperator !== null &&
        this.input !== null
      );
    },
    filterTypesFormatted() {
      return this.filterTypes.map(filterType => {
        if (filterType.name === 'CSV') {
          filterType.name = 'Multiple values ( comma separated )';
        }
        return filterType;
      });
    },
    isValidRow() {
      if (!this.hasRequiredData) {
        return false;
      }

      if (this.input.length <= 0 && this.selectedOperator.key !== '!=') {
        return false;
      }

      if (
        this.selectedType.key === 'time' ||
        this.selectedType.key === 'timestamp'
      ) {
        return strtotime(this.input) !== false;
      }

      return this.input.match(this.pattern) !== null;
    },
    placeholder() {
      if (!this.selectedType) {
        return this.input;
      }

      return this.selectedType.placeholder;
    },
    pattern() {
      switch (this.selectedType.key) {
        case 'integer':
          return '^-?\\d+$';
        case 'double':
          return '[+-]?([0-9]*[.])?[0-9]+';
        case 'boolean':
          return '\\b(?:false|true)\\b';
        case 'NULL':
          return '^(?![\\s\\S])';
        default:
          return '.*';
      }
    },
  },
  created() {
    if (this.hasRequiredData) {
      this.$emit('updateFilters', {
        id: this.selectedFilterId,
        field: this.selectedField,
        type: this.selectedType,
        operator: this.selectedOperator,
        input: this.input,
      });
    }
    if (!this.isValidRow) {
      this.$emit('filterError', {
        filterId: this.selectedFilterId,
        hasError: true,
        message:
          this.selectedFilterId === null
            ? ''
            : `${this.selectedField?.name} must be valid`,
      });
    }
  },
  methods: {
    selectedFieldChanged() {
      this.clearErrors();
      this.$emit('updateFilters', {
        id: this.selectedFilterId,
        field: this.selectedField,
        type: this.selectedType,
        operator: this.selectedOperator,
        input: '',
      });
    },
    selectedTypeChanged() {
      this.clearErrors();
      this.$emit('updateFilters', {
        id: this.selectedFilterId,
        field: this.selectedField,
        type: this.selectedType,
        operator: this.selectedOperator,
        input: this.input,
      });
      if (!this.isValidRow) {
        this.$emit('filterError', {
          filterId: this.selectedFilterId,
          hasError: true,
          message: `${this.selectedField?.name} must be valid`,
        });
      }
    },
    selectedOperatorChanged() {
      this.clearErrors();
      this.$emit('updateFilters', {
        id: this.selectedFilterId,
        field: this.selectedField,
        type: this.selectedType,
        operator: this.selectedOperator,
        input: this.input,
      });
    },
    inputChanged() {
      this.clearErrors();
      if (!this.isValidRow) {
        this.$emit('filterError', {
          filterId: this.selectedFilterId,
          hasError: true,
          message: `${this.selectedField?.name} must be valid`,
        });
        return;
      }

      this.$emit('updateFilters', {
        id: this.selectedFilterId,
        field: this.selectedField,
        type: this.selectedType,
        operator: this.selectedOperator,
        input: this.input,
      });
    },
    clearErrors() {
      this.$emit('filterError', {
        filterId: this.selectedFilterId,
        hasError: false,
      });
    },
    removeFilterRow() {
      this.clearErrors();
      this.$emit('removeFilterRow', this.selectedFilterId);
    },
  },
};
</script>
