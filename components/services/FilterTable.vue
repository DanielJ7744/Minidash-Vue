<template>
  <div class="space-y-3">
    <div class="hidden sm:flex w-full">
      <div
        v-for="(header, idx) in ['Field', 'Type', 'Operator', 'Value']"
        :key="idx"
        class="flex-1"
      >
        <h6 class="m-0 text-sm">
          {{ header }}
        </h6>
      </div>
      <div class="w-8" />
    </div>
    <div>
      <ServicesFilterTableRow
        v-for="filter in formattedFilters"
        :key="filter.id"
        :selected-filter-id="filter.id"
        :selected-filter-value="filter.value"
        :selected-filter-field="filter.field"
        :selected-filter-type="filter.type"
        :selected-filter-operator="filter.operator"
        :filter-fields="filterFields"
        :filter-types="getFilterTypes(filter.field)"
        @removeFilterRow="removeFilterRow"
        @updateFilters="updateFilters"
        @filterError="updateFilterErrors"
      />
    </div>

    <div class="mr-0 sm:mr-10">
      <div class="button button-primary" @click="addFilterRow">
        <span class="icon icon--plus mr-3" />
        Add Filter
      </div>
    </div>

    <span
      v-for="error in filterErrors"
      :key="error.filterId"
      class="service-filters__errors"
      >{{ error.message }}</span
    >
  </div>
</template>

<script>
import { showError } from '@/lib/api/error';

export default {
  name: 'FilterTable',
  props: {
    initialFilters: {
      type: Array,
      required: true,
    },
    filterFields: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      filters: this.initialFilters,
      filterErrors: [],
    };
  },
  computed: {
    emptyFilter() {
      return {
        id: null,
        field: null,
        type: null,
        operator: null,
        value: '',
      };
    },
    formattedFilters() {
      return this.filters.map(filter => {
        if (filter.field === null) {
          return this.emptyFilter;
        }

        const filterField = this.getFilterField(filter.field);

        return {
          id: filter.id,
          field: filterField,
          type: this.getFilterType(filterField, filter.type),
          operator: this.getFilterOperator(filterField, filter.operator),
          value: filter.value,
        };
      });
    },
  },
  watch: {
    formattedFilters() {
      this.$emit('update:modelValue', this.formattedFilters);
    },
    filterErrors(filterErrors) {
      this.$emit('hasFilterErrors', filterErrors.length > 0);
    },
  },
  methods: {
    getFilterField(field) {
      if (!field) {
        return null;
      }

      return this.filterFields.find(
        filterField => parseInt(filterField.id) === parseInt(field.id)
      );
    },
    getFilterType(filterField, type) {
      if (!filterField || !type) {
        return null;
      }

      return filterField.filter_types.find(
        filterType => parseInt(filterType.id) === parseInt(type.id)
      );
    },
    getFilterTypes(filterField) {
      return !filterField ? [] : filterField.filter_types;
    },
    getFilterOperator(filterField, operator) {
      if (!filterField || !operator) {
        return null;
      }

      return filterField.filter_operators.find(
        filterOperator => parseInt(filterOperator.id) === parseInt(operator.id)
      );
    },
    updateFilterErrors(filterError) {
      if (!filterError.hasError) {
        this.filterErrors.splice(this.getErrorIndex(filterError.filterId), 1);

        return;
      }

      this.filterErrors.splice(
        this.getErrorIndex(filterError.filterId),
        0,
        filterError
      );
    },
    getUniqueFilterID(filterField, filterOperator) {
      if (!filterOperator) {
        return filterField.key;
      }

      return `${filterField.key} ${filterOperator.key}`;
    },
    updateFilters({ id, field, type, operator, input }) {
      if (!type || !this.getFilterType(field, type)) {
        if (field.default_type) {
          type = field.default_type;
        } else {
          type = null;
        }
      }

      if (!operator || !this.getFilterOperator(field, operator)) {
        if (field.default_operator) {
          const matchingOperator = field.filter_operators.find(
            operator => operator.key === field.default_operator.key
          );
          if (matchingOperator) {
            operator = matchingOperator;
          }
        } else {
          operator = null;
        }
      }

      if (input === '' && field.default_value) {
        input = field.default_value;
      }

      const newFilterId = this.getUniqueFilterID(field, operator);
      const existingFilterIndex = this.getFilterIndex(newFilterId);
      if (newFilterId !== id && existingFilterIndex !== -1) {
        this.filters.splice(this.getFilterIndex(id), 1);
        showError(this.$notify, 'Cannot have duplicate filters', 5000);

        return;
      }

      this.filters.splice(this.getFilterIndex(id), 1, {
        id: newFilterId,
        field,
        type,
        operator,
        value: input,
      });
    },
    addFilterRow() {
      const filter = this.emptyFilter;
      if (this.getFilterIndex(null) === -1) {
        this.filters.push(filter);
      }
    },
    removeFilterRow(id) {
      this.filters.splice(this.getFilterIndex(id), 1);
    },
    getFilterIndex(id) {
      return this.filters.findIndex(filter => filter.id === id);
    },
    getErrorIndex(filterId) {
      return this.filterErrors.findIndex(error => error.filterId === filterId);
    },
  },
};
</script>
