<template>
  <div class="space-y-5 divide-y">
    <div class="space-y-5">
      <div class="space-y-3 lg:flex lg:items-end lg:space-y-0">
        <div class="flex-1">
          <h1 class="h4">Connection settings</h1>
        </div>
      </div>
    </div>

    <UiLoading v-if="$fetchState.pending" />

    <div v-else>
      <Modal
        id="deleteConnector"
        title="Are you sure?"
        classes="modal--small"
        :close-on-backdrop-click="false"
      >
        <ConnectionsDeleteConnectorModal
          :has-services="servicesForCredential.length"
          @delete="deleteCredentials()"
        />
      </Modal>
      <UiTitledCard v-if="!isOAuth2" title="General">
        <form @submit.prevent="updateConnector()">
          <div class="mb-2">
            <label>Connector Name/Description</label>
            <input
              v-model="connectorName"
              type="text"
              placeholder="Please enter a name or description for your connector"
              required
              min="3"
              max="255"
              pattern="[a-zA-Z0-9 \-&[\]\+_]+"
              title="Name must contain alphanumeric, ampersand, dash and space characters only."
              class="w-full"
            />
          </div>
          <div class="mb-2">
            <label>Timezone</label>
            <select
              v-model="selectedTimeZone"
              class="w-full bg-white content--full-width"
            >
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
          <FormDateFormat v-model="selectedDateFormat" class="mb-2" />
          <div class="flex justify-end">
            <button type="submit" class="button button-primary">
              Update Connector
            </button>
          </div>
        </form>
      </UiTitledCard>
      <hr v-if="!isOAuth2" />
      <UiTitledCard title="Credentials">
        <ConnectionsIntegrationCredentialsForm
          ref="integrationCredentialsForm"
          :fields="getCredentialSchema()"
          :initial-data="credential.credentials"
          http-method="patch"
          :auth-type="credential.credentials.authorisation_type"
          :system="matchingSystemAuthType"
          :integration-id="integration.id"
          :environment="credential.environment"
          :time-zone="selectedTimeZone"
          :date-format="selectedDateFormat"
          :is-update="true"
          :redirect-url="`/connections/${route.params.connectionId}`"
        />
        <div class="flex justify-end">
          <button
            type="submit"
            class="button button-primary"
            :disabled="requestBeingMade"
            @click="sendFormSubmit()"
          >
            Update Credentials
          </button>
        </div>
      </UiTitledCard>
      <template v-if="system.name === 'SFTP'">
        <hr />
        <UiTitledCard title="Entities">
          <EntitiesCustomEntities :integration="integration" :system="system" />
        </UiTitledCard>
      </template>
      <hr />
      <div class="flex justify-between flex-1 py-5 space-x-2">
        <div>
          <button
            type="button"
            class="px-6 md-px-10 button button-danger"
            :disabled="requestBeingMade"
            @click="openModal('deleteConnector')"
          >
            Delete Connector
          </button>
        </div>
        <div>
          <button
            type="button"
            class="px-6 md-px-10 button button-secondary"
            :disabled="requestBeingMade"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import timeZones from 'timezones-list';
import { systemsHelperMixin } from '@/mixins/system-helper-mixin';

const EventBus = useLegacyEventBus();

export default {
  name: 'ConnectorSettings',
  mixins: [systemsHelperMixin],
  props: {
    credential: {
      type: Object,
      required: true,
    },
    integration: {
      type: Object,
      required: true,
    },
    system: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {
      route: useRoute(),
    };
  },
  data() {
    return {
      requestBeingMade: false,
      services: [],
      connectorName: null,
      timeZones,
      selectedTimeZone:
        this.credential?.timezone ??
        this.system?.time_zone ??
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      selectedDateFormat:
        this.credential?.date_format ??
        this.system?.date_format ??
        'Y-m-d H:i:s',
      systems: null,
    };
  },
  async fetch() {
    this.systems = await this.$axios
      .$get(
        '/api/api/v2/systems?include=systemAuthorisationTypes.authorisationType'
      )
      .then((r) => r.data);
    this.services = await this.$axios
      .$get(`/api/api/v2/integrations/${this.integration.id}/services`)
      .then((r) => r.data);
  },
  computed: {
    isOAuth2() {
      return this.credential?.authorisation_type === 'oauth2';
    },
    credentialsId() {
      return this.route.params.connectionId;
    },
    matchingSystemAuthType() {
      return this.systems.find(
        (system) => parseInt(system.id) === this.credentialSystemId
      );
    },
    credentialSystemId() {
      return parseInt(this.credential.system.id);
    },
    credentialEnvironment() {
      return this.credential.environment;
    },
    servicesForCredential() {
      return this.services
        .filter(
          (service) =>
            (parseInt(service.source_system_id) === this.credentialSystemId &&
              service.from_environment === this.credentialEnvironment) ||
            (parseInt(service.destination_system_id) ===
              this.credentialSystemId &&
              service.to_environment === this.credentialEnvironment)
        )
        .filter((service) => service.username === this.integration.username);
    },
  },
  mounted() {
    if ('connector_name' in this.credential.credentials) {
      this.connectorName = this.credential.credentials.connector_name;
    }
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    ...mapActions(useSystemStore, ['deleteCredentialsById']),
    displayFailedResponses(results) {
      results.forEach((failedResponse) => {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: failedResponse.reason.message,
          },
          4000
        );
      });
    },
    sendFormSubmit() {
      this.$refs.integrationCredentialsForm.$refs.credentialFormSubmit.click();
    },
    getCredentialSchema() {
      const schema = this.addIdToFieldSchema(
        this.getCredentialFields(this.matchingSystemAuthType)
      );
      if ('authorisation_type' in this.credential.credentials) {
        const matchingSchema = schema.credential_fields.find(
          (credentialSchema) =>
            credentialSchema.auth_type ===
            this.credential.credentials.authorisation_type
        );
        return !matchingSchema ? {} : matchingSchema;
      }
      // this will need to change when we have more than 1 auth type per system
      return schema.credential_fields[0];
    },
    addIdToFieldSchema(schema) {
      schema.credential_fields.forEach((credentialField, index) => {
        credentialField.id = {
          type: 'hidden',
          label: null,
          show: false,
          disabled: true,
          defaultValue: this.credential.id,
        };
        schema.credential_fields[index] = credentialField;
      });
      return schema;
    },
    async deleteCredentials() {
      this.closeModal();
      this.requestBeingMade = true;

      try {
        await this.deleteCredentialsById(this.credentialsId);
        navigateTo({ name: 'connections' });
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to delete credentials: ${error}`,
          },
          4000
        );
      }

      this.requestBeingMade = false;
    },
    async updateConnector() {
      const formData = {
        connector_name: this.connectorName,
        environment: this.credential.environment,
        timezone: this.selectedTimeZone,
        date_format: this.selectedDateFormat,
      };
      try {
        const connector = await this.$axios
          .$patch(`/api/api/v2/connectors/${this.credential.id}`, formData)
          .then((r) => r.data);
        EventBus.emit('connector:updated', connector);

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully updated connector',
          },
          4000
        );
      } catch (e) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed updating connector. Error: ${e}`,
          },
          4000
        );
      }
    },
  },
};
</script>
