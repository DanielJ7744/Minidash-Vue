<template>
  <json-editor
    v-model="form"
    hide-button
    class="service-filters__advanced-editor"
    :value="form"
    button-text="Save"
  />
</template>

<script>
export default {
  name: 'ServiceFilterSettingsAdvanced',
  model: {
    prop: 'json',
  },
  props: {
    service: {
      type: Object,
      required: true,
    },
    json: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      form: {},
      hasFilterErrors: false,
    };
  },
  watch: {
    json: {
      handler() {
        this.form = this.json;
      },
      immediate: true,
    },
    form: {
      handler: 'handleUpdate',
      immediate: true,
    },
  },
  methods: {
    handleUpdate() {
      this.$emit('modelValue', this.form);
    },
  },
};
</script>
