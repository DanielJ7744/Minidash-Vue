<template>
  <div :class="{ 'space-y-2': label }">
    <div class="flex items-end justify-between">
      <div class="space-y-1">
        <label v-if="label" :for="title" :class="{ 'font-semibold': bold }">
          {{ label }}
          <span
            v-if="required"
            :class="!!modelValue ? 'text-success-500' : 'text-danger-500'"
            >*</span
          >
        </label>
      </div>

      <div v-if="tooltip">
        <UiTooltip :message="tooltip" />
      </div>
    </div>

    <div ref="element">
      <slot
        :inputProps="{
          value: modelValue,
          id: title,
          name: title,
          required,
          disabled,
        }"
        :inputEvents="{ input: handleUpdate, change: handleUpdate }"
      />

      <p v-if="$slots.info" class="mt-2 text-xs text-gray-500">
        <slot name="info" />
      </p>
    </div>

    <FormValidationError v-if="title" :error="errors[title]" />
  </div>
</template>

<script>
export default {
  name: 'FormElement',
  props: {
    title: {
      type: String,
      required: false,
      default: undefined,
    },
    required: {
      type: Boolean,
      required: false,
      default: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    label: {
      type: String,
      required: false,
      default: null,
    },
    bold: {
      type: Boolean,
      required: false,
      default: false,
    },
    tooltip: {
      type: String,
      required: false,
      default: null,
    },
    modelValue: {
      type: [String, Number, null],
      required: false,
      default: null,
    },
    errors: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    focus: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {
    handleUpdate(e) {
      this.$emit('update:modelValue', e.target.value);
    },
  },
  mounted() {
    if (this.focus) {
      this.$refs.element?.querySelector('input')?.focus();
    }
  },
};
</script>
