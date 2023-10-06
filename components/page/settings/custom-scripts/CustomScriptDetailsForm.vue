<template>
  <div>
    <div class="mb-2">
      <FormElement
        v-model="form.name"
        title="name"
        label="Name"
        :errors="errors"
        required
        v-slot="{ inputProps, inputEvents }"
      >
        <input
          type="text"
          class="w-full"
          placeholder="Name"
          pattern="[a-zA-Z0-9 \-&[\]\+_]+"
          title="Name must contain alphanumeric, ampersand, dash and space characters only."
          minlength="1"
          maxlength="255"
          v-bind="inputProps"
          v-on="inputEvents"
        />
      </FormElement>
    </div>
    <div class="mb-2">
      <FormElement
        v-model="form.description"
        title="description"
        label="Description"
        :errors="errors"
        required
        v-slot="{ inputProps, inputEvents }"
      >
        <input
          type="text"
          class="w-full"
          placeholder="Description"
          pattern="[a-zA-Z0-9 \-&[\]\+_]+"
          title="Name must contain alphanumeric, ampersand, dash and space characters only."
          minlength="1"
          maxlength="255"
          v-bind="inputProps"
          v-on="inputEvents"
        />
      </FormElement>
    </div>
    <FormLockableDropdown
      v-model="form.language"
      title="language"
      label="Language"
      :errors="errors"
      required
      :dropdown-options="languages"
      :lock-dropdown="hasLanguage"
      class="mb-2"
    />
    <div class="mb-2">
      <FormElement
        v-model="form.script_level"
        title="script_type"
        label="Script Type"
        :errors="errors"
        required
        v-slot="{ inputProps, inputEvents }"
      >
        <select
          class="content--full-width w-full bg-white"
          v-bind="inputProps"
          v-on="inputEvents"
        >
          <option value="field_level">Field Level</option>
          <option value="payload_level">Payload Level</option>
        </select>
      </FormElement>
    </div>
    <div class="mb-2">
      <FormElement
        v-model="form.return_type"
        title="return_type"
        label="Return Type"
        :errors="errors"
        required
        v-slot="{ inputProps, inputEvents }"
      >
        <select
          class="w-full bg-white"
          v-bind="inputProps"
          :disabled="isPayloadLevel"
          v-on="inputEvents"
        >
          <option
            v-for="returnType in scriptReturnTypes"
            :key="returnType"
            :value="returnType"
            class="capitalize"
          >
            {{ returnType }}
          </option>
        </select>
      </FormElement>
    </div>
    <div v-if="isFieldLevel" class="mb-2">
      <FormElement
        v-model="form.default_fail_value"
        title="return_value"
        label="Return value on script failure"
        :errors="errors"
        required
        v-slot="{ inputProps, inputEvents }"
      >
        <input
          type="text"
          class="w-full"
          placeholder="Return value on script failure"
          v-bind="inputProps"
          v-on="inputEvents"
        />
      </FormElement>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomScriptDetailsForm',
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
  },
  data() {
    return {
      languages: [
        'node16',
        'node17',
        'php7',
        'php8',
        // 'python',
        // 'python3',
        // 'go',
        // 'java11',
        // 'ruby',
        // 'csharp'
      ],
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
    isFieldLevel() {
      return this.form.script_level === 'field_level';
    },
    isPayloadLevel() {
      return this.form.script_level === 'payload_level';
    },
    hasLanguage() {
      return !!this.form.language;
    },
    scriptReturnTypes() {
      if (!this.isFieldLevel && !this.isPayloadLevel) {
        return [];
      }

      if (this.isFieldLevel) {
        return ['string', 'integer', 'float', 'boolean', 'datetime', 'NULL'];
      }

      // no need for xml/csv for now as tapestry cant use it
      return [
        'json',
        // 'xml',
        // 'csv'
      ];
    },
  },
};
</script>
