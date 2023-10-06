<template>
  <div v-if="!dataLoading" class="one-column-grid">
    <div v-if="companyIntegrations.length > 0">
      <div class="flex gap-x-2">
        <div>
          <span>Please select the group this system is for</span>
        </div>
        <div>
          <UiTooltip
            message="This allows us to organise your credentials using the groups you have set up in your Company Profile"
          />
        </div>
      </div>
      <select v-model="integrationSelected" class="content--full-width">
        <option
          v-for="(
            companyIntegration, companyIntegrationIndex
          ) in companyIntegrations"
          :key="companyIntegrationIndex"
          :value="companyIntegration.name"
        >
          {{ companyIntegration.name }}
        </option>
      </select>
    </div>
    <div
      v-if="companyIntegrations.length === 0"
      class="flex flex-col items-center py-2 border border-solid gap-y-2 border-rose-600"
    >
      <div class="font-medium">
        You currently do not have any company groups set up. Please click the
        button below to set one up.
      </div>
      <div>
        <NuxtLink
          :to="{
            name: 'settings-company-profiles-profileId',
            params: { profileId: $auth.user.company_id },
          }"
        >
          <button type="button" class="button">Set up company group</button>
        </NuxtLink>
      </div>
    </div>
    <div v-if="companyIntegrations.length > 0">
      <label>Please select if this is a live or testing system</label>
      <select v-model="environment" class="content--full-width">
        <option :value="'live'">Live</option>
        <option :value="'staging'">Testing</option>
      </select>
    </div>
    <div v-if="companyIntegrations.length > 0">
      <label>Time Zone</label>
      <select v-model="selectedTimeZone" class="content--full-width">
        <option value="UTC">UTC</option>
        <option
          v-for="(timeZone, idx) in timeZones"
          :key="idx"
          :value="timeZone.tzCode"
        >
          {{ timeZone.label }}
        </option>
      </select>
    </div>
    <FormDateFormat
      v-if="companyIntegrations.length > 0"
      v-model="selectedDateFormat"
      class="mb-2"
    />
    <div v-if="integrationSelected !== 'please_select'">
      <div v-if="system.name === 'Emarsys'">
        <ConnectionsIntegrationCredentialsForm
          :fields="getEmarsysCredentialFields()"
          :http-method="'post'"
          :system="system"
          :auth-type="selectedAuthType"
          :integration-id="findMatchingIntegration()"
          :environment="environment"
          :time-zone="selectedTimeZone"
          :date-format="selectedDateFormat"
        />
      </div>
      <div v-else-if="authTypes.length > 1">
        <label>Authentication Type</label>
        <select v-model="selectedAuthType" class="full-width">
          <option v-for="type in authTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
        <ConnectionsIntegrationCredentialsForm
          :fields="findMatchingCredentialFields(selectedAuthType)"
          :http-method="'post'"
          :system="system"
          :extra-form-data="extraFormData"
          :auth-type="selectedAuthType"
          :integration-id="findMatchingIntegration()"
          :environment="environment"
          :time-zone="selectedTimeZone"
          :date-format="selectedDateFormat"
        />
      </div>
      <div v-else>
        <ConnectionsIntegrationCredentialsForm
          :fields="credentialFields[0]"
          :http-method="'post'"
          :system="system"
          :auth-type="selectedAuthType"
          :integration-id="findMatchingIntegration()"
          :environment="environment"
          :time-zone="selectedTimeZone"
          :date-format="selectedDateFormat"
        />
      </div>
    </div>
  </div>
  <UiLoading v-else class="w-full" label="Loading Data..." />
</template>

<script>
import { mapActions, mapState } from 'pinia';
import timeZones from 'timezones-list';

export default {
  name: 'CredentialAdderManual',
  props: {
    fields: {
      type: Object,
      required: true,
    },
    system: {
      type: Object,
      required: true,
    },
    authType: {
      type: String,
      required: false,
      default: () => null,
    },
    extraFormData: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      selectedAuthType: this.authType ?? this.fields.auth_types[0],
      integrationSelected: 'please_select',
      environment: 'live',
      timeZones,
      selectedTimeZone:
        this.system?.time_zone ??
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      selectedDateFormat: this.system?.date_format ?? 'Y-m-d H:i:s',
      dataLoading: true,
    };
  },
  computed: {
    ...mapState(useSystemStore, {
      companyIntegrations: 'companyIntegrations',
    }),
    authTypes() {
      return this.fields.auth_types;
    },
    credentialFields() {
      return this.fields.credential_fields;
    },
  },
  mounted() {
    this.loadCompanyIntegrations({ page_number: 1, force_reload: true })
      .then(() => {
        this.populateInitialData();
        this.dataLoading = false;
      })
      .catch((e) => {
        this.dataLoading = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed loading company groups: ${e}`,
          },
          4000
        );
      });
  },
  methods: {
    ...mapActions(useSystemStore, ['loadCompanyIntegrations']),
    populateInitialData() {
      if (this.companyIntegrations.length > 0) {
        this.integrationSelected = this.companyIntegrations[0].name;
      }
    },
    getEmarsysCredentialFields() {
      const fields = Object.assign({}, ...this.credentialFields);
      fields.auth_type = 'basic_auth & FTP';
      return fields;
    },
    findMatchingCredentialFields(authType) {
      const matchingFields = this.credentialFields.find(
        (credentialField) => credentialField.auth_type === authType
      );
      if (!matchingFields) {
        return {};
      }
      return matchingFields;
    },
    findMatchingIntegration() {
      const matchingIntegration = this.companyIntegrations.find(
        (companyIntegration) =>
          companyIntegration.name === this.integrationSelected
      );
      if (!matchingIntegration) {
        return 0;
      }
      return parseInt(matchingIntegration.id);
    },
  },
};
</script>
