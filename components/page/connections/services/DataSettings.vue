<template>
  <div>
    <JsonEditor
      v-if="useJsonEditor"
      v-model="form"
      :display-back-link="!displayJSONEditorOnly"
      :back-text="'Use normal editor'"
      :use-position-classes="false"
      :hide-button="hideSaveButton"
      @go-back="goBack"
    />
    <div v-else>
      <FormElement
        v-if="canDisplayPageSize"
        v-model="form.page_size"
        title="from_options.page_size"
        label="Page size"
        :errors="errors"
        :required="showFieldsAsRequired"
        class="mb-2"
        v-slot="{ inputProps, inputEvents }"
      >
        <select
          id="source_integration_name"
          name="max_attempts"
          class="w-full bg-white"
          v-bind="inputProps"
          v-on="inputEvents"
        >
          <option
            v-for="i in [10, 25, 50, 100, 125, 150, 175, 200, 250, 500, 1000]"
            :key="i"
            :value="i"
          >
            {{ i }}
          </option>
        </select>
      </FormElement>
      <FormElement
        v-if="canDisplayMaxAttempts"
        v-model="form.max_attempts"
        title="from_options.max_attempts"
        label="Maximum attempts"
        :errors="errors"
        :required="showFieldsAsRequired"
        class="mb-2"
        v-slot="{ inputProps, inputEvents }"
      >
        <select
          id="source_max_attempts"
          name="max_attempts"
          class="w-full bg-white"
          v-bind="inputProps"
          v-on="inputEvents"
        >
          <option v-for="i in 15" :key="i" :value="i">
            {{ i }}
          </option>
        </select>
      </FormElement>
      <FormElement
        v-model="form.timezone"
        title="time_zone"
        label="Time zone"
        :errors="errors"
        class="mb-2"
        v-slot="{ inputProps, inputEvents }"
      >
        <select
          id="time_zone"
          name="time_zone"
          class="w-full bg-white"
          v-bind="inputProps"
          v-on="inputEvents"
        >
          <option value="UTC" label="UTC">UTC</option>
          <option
            v-for="(timeZone, idx) in timeZones"
            :key="idx"
            :value="timeZone.tzCode"
          >
            {{ timeZone.label }}
          </option>
        </select>
      </FormElement>
      <div
        v-if="serviceTemplateOptions && serviceTemplateOptions.length"
        class="mt-4 space-y-5"
      >
        <div
          v-for="(
            serviceTemplateOption, serviceTemplateOptionIndex
          ) in serviceTemplateOptions"
          :key="serviceTemplateOptionIndex"
        >
          <div
            v-if="serviceTemplateOption.value_type === 'boolean'"
            class="flex items-center gap-x-2"
          >
            <input
              v-model="form[serviceTemplateOption.service_option.key]"
              type="checkbox"
            />
            <label class="capitalize">{{
              serviceTemplateOption.service_option.key.replaceAll('_', ' ')
            }}</label>
          </div>

          <FormElement
            v-else
            v-model="form[serviceTemplateOption.service_option.key]"
            :label="
              serviceTemplateOption.service_option.key.replaceAll('_', ' ')
            "
            :title="serviceTemplateOption.service_option.key"
            v-slot="{ inputProps, inputEvents }"
          >
            <select
              v-if="serviceTemplateOption.properties"
              class="w-full bg-white"
            >
              <option
                v-for="option in serviceTemplateOption.properties.options"
                :key="option"
                :value="option"
                v-bind="inputProps"
                v-on="inputEvents"
              >
                {{ option }}
              </option>
            </select>
            <input
              v-else
              type="text"
              :placeholder="serviceTemplateOption.value"
              class="w-full bg-white"
              v-bind="inputProps"
              v-on="inputEvents"
            />
          </FormElement>
        </div>
      </div>
      <div v-if="$can('json editor')" class="flex justify-end">
        <button
          type="button"
          class="button button-secondary"
          @click="editOptions()"
        >
          Use JSON Editor
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import timeZones from 'timezones-list';

export default {
  name: 'DataSettings',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    errors: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    displayJSONEditorOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
    hideSaveButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    showFieldsAsRequired: {
      type: Boolean,
      required: false,
      default: true,
    },
    selectedServiceTemplate: {
      type: Object,
      required: false,
      default: null,
    },
    selectedFactorySystem: {
      type: Object,
      required: false,
      default: null,
    },
    direction: {
      type: String,
      required: false,
      default: 'source',
    },
  },
  data() {
    return {
      useJsonEditor: false,
      timeZones,
    };
  },
  computed: {
    form: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
    canDisplayPageSize() {
      return this.form?.page_size;
    },
    canDisplayMaxAttempts() {
      return this.form?.max_attempts;
    },
    serviceTemplateOptions() {
      if (
        !this.selectedServiceTemplate ||
        !this.selectedServiceTemplate?.service_template_options ||
        this.selectedServiceTemplate?.service_template_options.length <= 0
      ) {
        if (
          !this.selectedFactorySystem ||
          !this.selectedFactorySystem?.service_options
        ) {
          return null;
        }

        return this.selectedFactorySystem.service_options.filter(
          (option) => option.user_configurable === true
        );
      }
      return this.selectedServiceTemplate.service_template_options.filter(
        (option) => option.target === this.direction && option.user_configurable
      );
    },
  },
  mounted() {
    this.setServiceOptionDefaults();
    if (this.displayJSONEditorOnly) {
      this.editOptions();
    }
  },
  methods: {
    setServiceOptionDefaults() {
      if (!this.serviceTemplateOptions || !this.serviceTemplateOptions.length) {
        return;
      }

      this.serviceTemplateOptions.forEach((serviceTemplateOption) => {
        if (this.form[serviceTemplateOption.service_option.key]) {
          return;
        }

        this.form[serviceTemplateOption.service_option.key] =
          serviceTemplateOption.value;
      });
    },
    goBack() {
      this.useJsonEditor = false;
    },
    editOptions() {
      this.useJsonEditor = true;
    },
    setValueToNull(formKey) {
      this.form[formKey] = null;
    },
    canShowInputCross(serviceTemplateOption) {
      return serviceTemplateOption?.value_type !== 'boolean';
    },
  },
};
</script>
