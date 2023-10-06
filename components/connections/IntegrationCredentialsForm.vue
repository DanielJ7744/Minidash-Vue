<template>
  <form v-if="isReady" class="space-y-3" @submit.prevent="submitForm()">
    <div v-if="fields.auth_type">
      <h6 class="h6">
        Authentication Type:
        <UiBadge>{{ formatAuthenticationType(fields.auth_type) }}</UiBadge>
      </h6>
    </div>
    <div v-if="!isUpdate || isOAuth2">
      <label>Connector Name/Description</label>
      <input
        v-model="connectorName"
        type="text"
        placeholder="Please enter a name or description for your connector"
        required
        min="3"
        max="255"
        pattern="[a-zA-Z \-[\]!&0-9]+$"
        title="Name must contain alphanumeric, ampersand, dash and space characters only."
        class="w-full"
      />
    </div>
    <div
      v-for="(field, key) in fields"
      :key="key"
      :class="{
        'form-item--hidden':
          field.type === 'hidden' || typeof field !== 'object',
      }"
    >
      <div class="flex gap-x-2">
        <div>
          <label v-if="field.label" class="content--full-width">{{
            field.label
          }}</label>
        </div>
        <div>
          <UiTooltip v-if="field.tooltip" :message="field.tooltip" />
        </div>
      </div>
      <input
        v-if="['text', 'password', 'number'].includes(field.type)"
        :modelValue="getValue(key, field)"
        :type="field.type"
        :placeholder="
          getPlaceHolder(getValue(key, field, true), field.placeholder)
        "
        class="full-width"
        :class="{ 'form-item__failed': hasErrors }"
        :required="isFieldRequired(field)"
        @update:modelValue="setValue(key, field, $event.target.value)"
      />
      <select
        v-else-if="field.type === 'select'"
        v-model="formData[key]"
        class="full-width"
        :class="{ 'form-item__failed': hasErrors }"
        :required="isFieldRequired(field)"
        :value="getValue(key, field)"
        @change="setValue(key, field, $event.target.value)"
      >
        <template v-if="field.reversed_options">
          <option
            v-for="(value, label) in field.options"
            :key="value"
            :value="value"
          >
            {{ label }}
          </option>
        </template>
        <template v-else>
          <option
            v-for="(label, value) in field.options"
            :key="value"
            :value="value"
          >
            {{ label }}
          </option>
        </template>
      </select>
      <div v-if="field.hint" :class="{ 'form-item__hint--hidden': field.hint }">
        {{ field.hint }}
      </div>
    </div>
    <div v-if="system.environment_suffix_title">
      <div class="flex gap-x-2">
        <div>
          <label>{{ system.environment_suffix_title }}</label>
        </div>
        <div>
          <UiTooltip
            message="Must not contain 'live, dev, test, stag or prod'"
          />
        </div>
        <div>
          <p class="text-red-600">
            Duplicated transaction IDs in the same environment will be removed
          </p>
        </div>
      </div>
      <input
        :modelValue="environmentSuffix"
        type="text"
        :placeholder="
          'Please enter the unique ' + system.environment_suffix_title
        "
        class="w-full"
        :class="{ 'form-item__failed': hasErrors && errors['environment'] }"
        @update:modelValue="setValue()"
      />
      <p
        v-if="hasErrors && errors['environment']"
        class="text-xs text-danger-600"
      >
        {{ errors['environment'][0] }}
      </p>
    </div>
    <div
      v-if="hasErrors"
      class="card"
      :class="{ 'form-item__failed': hasErrors }"
    >
      <span v-if="systemAuthWarning[1] === undefined">
        {{ systemAuthWarning[0] }}
      </span>
      <a v-else :href="systemAuthWarning[1]">
        {{ systemAuthWarning[0] }}
      </a>
    </div>
    <div>
      <button
        ref="credentialFormSubmit"
        type="submit"
        class="button button-primary"
        :class="{ hidden: isUpdate }"
        :disabled="isMakingRequest || hasErrors"
      >
        Submit
      </button>
    </div>
    <UiLoading
      v-if="isMakingRequest"
      class="w-full"
      label="Saving credentials"
    />
  </form>
</template>

<script>
import { mapActions } from 'pinia';
import clone from 'just-clone';
import { systemsHelperMixin } from '@/mixins/system-helper-mixin';
import { formatAuthenticationTypeName } from '@/lib/authorisationTypes';
import { credentialFormHelperMixin } from '@/mixins/credential-form-helper-mixin';

export default {
  name: 'IntegrationCredentialsForm',
  mixins: [systemsHelperMixin, credentialFormHelperMixin],
  props: {
    fields: {
      type: Object,
      required: true,
    },
    initialData: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    httpMethod: {
      type: String,
      required: false,
      default: 'post',
    },
    authType: {
      type: String,
      required: false,
      default: null,
    },
    extraFormData: {
      type: Object,
      required: false,
      default: () => {},
    },
    system: {
      type: Object,
      required: true,
    },
    integrationId: {
      type: Number,
      required: true,
    },
    environment: {
      type: String,
      required: true,
    },
    timeZone: {
      type: String,
      required: true,
    },
    dateFormat: {
      type: String,
      required: false,
      default: undefined,
    },
    isUpdate: {
      type: Boolean,
      required: false,
      default: false,
    },
    redirectUrl: {
      type: String,
      required: false,
      default: '/connections',
    },
  },
  data() {
    return {
      connectorName: null,
      isReady: false,
      isMakingRequest: false,
      formData: null,
      formDataToSubmit: null,
      hasErrors: false,
      environmentSuffix: null,
    };
  },
  computed: {
    isOAuth2() {
      return this.fields.auth_type === 'oauth2';
    },
    isOAuth1() {
      return this.fields.auth_type === 'oauth1';
    },
    submitUrl() {
      switch (this.fields.auth_type) {
        case 'oauth2':
          return '/api/api/v2/oauth-2';
        case 'oauth1':
          return '/api/api/v2/oauth-1';
        default:
          return '/api/api/v2/connectors';
      }
    },
    systemAuthWarning() {
      switch (this.system.name) {
        case 'Netsuite':
          return [
            'Authorisation Failed - Please make sure you have installed the Patchworks bundle',
            'https://wearepatchworks.gitbook.io/dashboard/systems/netsuite',
          ];
        case 'Shopify':
          switch (this.authType) {
            case 'basic_auth':
              return [
                'Authorisation Failed - Please make sure you have configured the Patchworks private Shopify app',
                'https://wearepatchworks.gitbook.io/dashboard/systems/shopify-shopify+',
              ];
            case 'oauth2':
              return [
                'Authorisation Failed - Please make sure you have installed the Patchworks Shopify app',
              ];
          }
      }

      return [
        'Please check through all fields and confirm that they are correct. If they are, please contact support and they will be able to look into the issue.',
      ];
    },
  },
  watch: {
    fields() {
      this.populateFormData();
    },
  },
  mounted() {
    this.populateFormData();
    this.isReady = true;
  },
  methods: {
    ...mapActions(useUiStore, {
      closeModal: 'closeModal',
    }),
    isFieldRequired(field) {
      return field.required ?? false;
    },
    setValue(key, field, value) {
      if (value === 'true' || value === 'false') {
        value = value === 'true';
      }
      this.hasErrors = false;
      if (key) {
        this.formData[key] = value;
      }
    },
    formatAuthenticationType(authorisationTypeName) {
      return formatAuthenticationTypeName(authorisationTypeName);
    },
    populateFormData() {
      let formDataWithValues = {};
      this.connectorName = this.initialData.connector_name ?? null;
      for (const [key, fieldProperties] of Object.entries(this.fields)) {
        if (typeof fieldProperties !== 'object') {
          formDataWithValues[key] = null;
          continue;
        }

        if (this.initialData[key]) {
          formDataWithValues[key] = this.initialData[key];
          continue;
        }

        if ('defaultValue' in fieldProperties) {
          formDataWithValues[key] = fieldProperties.defaultValue;
          continue;
        }

        formDataWithValues[key] = null;
      }
      formDataWithValues = Object.assign(
        formDataWithValues ?? {},
        this.initialData ?? {}
      );
      this.formData = formDataWithValues;
    },
    getValue(key, field, returnBaseValue = false) {
      return this.fieldIsMasked(this.formData[key]) && !returnBaseValue
        ? null
        : this.formData[key];
    },
    submitForm() {
      this.isMakingRequest = true;
      if (this.authType !== null) {
        this.formData[this.authType.toLowerCase().replace(' ', '_')] = true;
      }

      if (!this.isValidFormData() && this.httpMethod === 'post') {
        this.hasErrors = true;
        this.isMakingRequest = false;
        return;
      }

      this.prepareFormData();

      if (this.isOAuth1 || this.isOAuth2) {
        const formData = { ...this.formDataToSubmit, ...this.extraFormData };
        return this.$axios.post(this.submitUrl, formData).then((response) => {
          window.location = response.data.redirect_url;
        });
      }

      if (this.httpMethod === 'post') {
        this.sendPostRequest(this.formDataToSubmit, this.submitUrl, {})
          .then(() => {
            this.performSuccessResponseActions(this.redirectUrl);
          })
          .catch((e) => {
            this.performFailResponseActions(e);
          });
      } else {
        this.sendPatchRequest(this.formDataToSubmit, this.submitUrl)
          .then(() => {
            this.performSuccessResponseActions(this.redirectUrl);
          })
          .catch((e) => {
            this.performFailResponseActions(e);
          });
      }
    },
    prepareFormData() {
      this.formDataToSubmit = clone(this.formData);
      this.formDataToSubmit = this.removeMaskedAttributeData(
        this.formDataToSubmit
      );
      this.formDataToSubmit = this.removeEmptyNonRequiredFields(
        this.formDataToSubmit
      );
      this.formDataToSubmit = { credentials: this.formDataToSubmit };
      this.formDataToSubmit.id = this.formData.id;
      this.formDataToSubmit.authorisation_type =
        this.authType ?? this.fields.auth_type;
      this.formDataToSubmit.connector_name = this.connectorName;
      this.formDataToSubmit.environment = this.environment;
      this.formDataToSubmit.timezone = this.timeZone;
      this.formDataToSubmit.date_format = this.dateFormat;
      this.formDataToSubmit.system_id = this.system.id;
      this.formDataToSubmit.integration_id = this.integrationId;
      if (this.environmentSuffix) {
        this.formDataToSubmit.environment =
          this.environment + '_' + this.environmentSuffix;
      }
    },
    removeEmptyNonRequiredFields(formData) {
      const newData = {};
      for (const [key, value] of Object.entries(formData)) {
        if (
          key in this.fields &&
          this.fields[key].required === false &&
          value === null
        ) {
          continue;
        }

        newData[key] = value;
      }
      return newData;
    },
    isValidFormData() {
      let isValid = true;
      for (const [key, value] of Object.entries(this.fields)) {
        if (!(key in this.formData) && value?.required !== false) {
          isValid = false;
        }
      }
      return isValid;
    },
  },
};
</script>
