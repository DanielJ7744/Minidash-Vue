<template>
  <div class="space-y-6">
    <div
      v-if="Object.entries(errors).length === 1 && errors.credentials?.[0]"
      class="flex px-3 py-2 border-2 rounded border-danger-600 bg-danger-100/50"
    >
      <div>
        <span class="text-danger-600 icon icon--warning mr-3 mt-0.5" />
      </div>
      <div>
        <p class="text-danger-600">
          {{ authenticationFailedInfo.message }}
        </p>
        <a
          v-if="authenticationFailedInfo.link"
          :href="authenticationFailedInfo.link"
          target="_blank"
          class="underline"
          >See our help page</a
        >
      </div>
    </div>

    <div
      v-for="(field, key) in credentialFields.filter(
        attribute => attribute.type !== 'hidden'
      )"
      :key="key"
    >
      <FormElement
        v-model="form.credentials[field.value]"
        :title="`credentials.${field.value}`"
        :label="field.label"
        :errors="errors"
        :tooltip="field.tooltip"
        :required="field.required"
        bold
        v-slot="{ inputProps, inputEvents }"
      >
        <input
          v-if="['text', 'password', 'number'].includes(field.type)"
          :type="field.type"
          v-bind="inputProps"
          v-on="inputEvents"
        />
        <select
          v-else-if="field.type === 'select'"
          :required="!!field.required"
          v-bind="inputProps"
          v-on="inputEvents"
        >
          <option
            v-for="(label, value) in field.options"
            :key="value"
            :value="value"
          >
            {{ label }}
          </option>
        </select>
      </FormElement>
      <div v-if="field.hint" class="mt-1">
        {{ field.hint }}
      </div>
    </div>
  </div>
</template>

<script>
import { authenticationFailedInfo } from '@/lib/systemAuthentication';

export default {
  name: 'CredentialsDetails',
  props: {
    initial: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    errors: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    system: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      form: {
        credentials: {},
        ...this.initial,
      },
    };
  },
  computed: {
    credentialFields() {
      return (
        this.system.system_authorisation_types?.find(
          type => this.form.authorisation_type === type.authorisation_type.name
        )?.credentials_schema?.attributes || []
      );
    },
    authenticationFailedInfo() {
      return authenticationFailedInfo(
        this.system,
        this.form.authentication_type
      );
    },
  },
  watch: {
    form: {
      handler(details) {
        const hiddenFields = this.credentialFields
          .filter(field => field.type === 'hidden')
          .reduce(
            (hiddenFields, field) => ({
              ...hiddenFields,
              [field.value]: field.defaultValue,
            }),
            {}
          );

        this.$emit('update', {
          ...details,
          credentials: { ...details.credentials, ...hiddenFields },
        });
      },
      deep: true,
    },
  },
};
</script>
