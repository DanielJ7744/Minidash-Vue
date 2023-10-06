<template>
  <ServicesFilterTable
    :initial-filters="filters"
    :filter-fields="filterFieldsWithRelatedRecords"
    @update:modelValue="handleInput"
    @hasFilterErrors="setHasFilterErrors"
  />
</template>

<script>

export default {
  name: 'ServiceFilterSettings',
  props: {
    modelValue: {
      type: Array,
      required: true,
    },
    filterFields: {
      type: Array,
      required: true,
    },
    service: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      form: this.modelValue,
      hasFilterErrors: false,
    };
  },
  computed: {
    filters() {
      return this.service.filters?.length ? this.service.filters : [];
    },
    filterFieldsWithRelatedRecords() {
      return this.filterFields.map(function (filterField) {
        if (filterField.filter_operators.length) {
          return filterField;
        }

        filterField.filter_operators = filterField.filter_types.flatMap(
          function (filterType) {
            return filterType.filter_operators;
          }
        );

        filterField.filter_operators = [
          ...new Map(
            filterField.filter_operators.map(operator => [
              operator.id,
              operator,
            ])
          ).values(),
        ];

        return filterField;
      });
    },
  },
  watch: {
    modelValue: {
      handler() {
        this.form = this.modelValue;
      },
      immediate: true,
    },
  },
  methods: {
    handleInput(data) {
      this.$emit('update:modelValue', data);
    },
    setHasFilterErrors(hasFilterErrors) {
      this.hasFilterErrors = hasFilterErrors;
    },
  },
};
</script>
