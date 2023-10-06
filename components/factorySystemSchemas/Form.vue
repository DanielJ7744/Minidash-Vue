<template>
  <UiLoading v-if="$fetchState.pending" label="Loading Data..." />
  <div v-else-if="$fetchState.error" class="relative h-36">
    <UiError message="An error occurred." />
  </div>
  <form v-else @submit.prevent="saveFactorySystemSchema()">
    <UiTitledCard title="General">
      <div class="mb-2">
        <label> Integration ID </label>
        <input
          type="text"
          class="w-full"
          disabled
          :value="integrationIdToDisplay"
        />
      </div>
      <div class="mb-2">
        <label> Factory System ID </label>
        <input
          type="text"
          class="w-full"
          disabled
          :value="factorySystemId"
        />
      </div>
      <div>
        <label> Type </label>
        <select v-model="type" class="w-full" :disabled="makingRequest">
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
        </select>
      </div>
    </UiTitledCard>
    <hr />
    <UiTitledCard title="Schema">
      <div>
        <label> Schema </label>
        <template v-if="type === 'json'">
          <div class="grid grid-cols-1 min-h-screen">
            <JsonEditor v-model="schemaData" hide-button />
          </div>
        </template>
        <template v-else-if="type === 'csv'">
          <div class="grid grid-cols-1 min-h-screen">
            <input
              v-model="schemaData"
              type="text"
              class="w-full"
              :disabled="makingRequest"
            />
          </div>
        </template>
      </div>
    </UiTitledCard>
    <hr />
    <UiTitledCard title="Default Payload for Client Download">
      <div class="mb-2">
        <label> Type </label>
        <select
          v-model="defaultPayloadType"
          class="w-full"
          :disabled="makingRequest"
        >
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
        </select>
      </div>
      <div>
        <label> Payload </label>
        <template v-if="defaultPayloadType === 'json'">
          <div class="grid grid-cols-1 min-h-screen">
            <JsonEditor v-model="defaultPayload" hide-button />
          </div>
        </template>
        <template v-else-if="defaultPayloadType === 'csv'">
          <div class="grid grid-cols-1 min-h-screen">
            <input
              v-model="defaultPayload"
              type="text"
              class="w-full"
              :disabled="makingRequest"
            />
          </div>
        </template>
      </div>
    </UiTitledCard>
    <hr />
    <div class="flex justify-between">
      <div>
        <button
          v-if="schema"
          type="button"
          class="button button-danger"
          :disabled="makingRequest"
          @click="deleteFactorySystemSchema(factorySystemId, schemaId)"
        >
          Delete
        </button>
      </div>
      <div>
        <button
          type="button"
          class="button button-secondary"
          :disabled="makingRequest"
          @click="navigateTo(redirectLink)"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="button button-primary"
          :disabled="makingRequest"
        >
          Save
        </button>
      </div>
    </div>
  </form>
</template>

<script>
export default {
  name: 'FactorySystemSchemaForm',
  props: {
    factorySystemId: {
      type: Number,
      required: true,
    },
    schemaId: {
      type: Number,
      required: false,
      default: null,
    },
    redirectLink: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      schema: null,
      integrationId: null,
      type: 'json',
      schemaData: null,
      makingRequest: false,
      defaultPayloadType: 'json',
      defaultPayload: null,
    };
  },
  async fetch() {
    if (this.schemaId) {
      this.schema = await this.$axios
        .$get(
          `api/api/v2/admin/factory-system-schemas/${this.schemaId}?include=defaultPayload`
        )
        .then((r) => r.data);
      this.type = this.schema.type;
      this.schemaData =
        this.type === 'json'
          ? JSON.parse(this.schema.schema)
          : this.schema.schema;
      this.integrationId = this.schema.integration_id;
      if (this.schema.default_payload) {
        this.defaultPayloadType = this.schema.default_payload.type;
        this.defaultPayload =
          this.defaultPayloadType === 'json'
            ? JSON.parse(this.schema.default_payload.payload)
            : this.schema.default_payload.payload;
      }
    }
  },
  computed: {
    integrationIdToDisplay() {
      return this.integrationId === null ? 'Global' : this.integrationId;
    },
    schemaForPayload() {
      return this.type === 'json'
        ? JSON.stringify(this.schemaData)
        : this.schemaData;
    },
    payload() {
      return {
        factory_system_id: this.factorySystemId,
        integration_id: this.integrationId,
        type: this.type,
        schema: this.schemaForPayload,
      };
    },
    payloadForDefaultData() {
      return this.defaultPayloadType === 'json'
        ? JSON.stringify(this.defaultPayload)
        : this.defaultPayload;
    },
    defaultPayloadData() {
      const payload = {
        type: this.defaultPayloadType,
        payload: this.payloadForDefaultData,
      };
      if (this.schema) {
        payload.factory_system_schema_id = this.schema.id;
      }
      return payload;
    },
  },
  methods: {
    async saveFactorySystemSchema() {
      this.makingRequest = true;
      if (this.schema) {
        await this.updateFactorySystemSchema();
      } else {
        await this.createFactorySystemSchema();
      }

      if (this.defaultPayload !== null) {
        if (this.schema.default_payload) {
          await this.updateDefaultPayload();
        } else {
          await this.createDefaultPayload();
        }
      }
      this.$notify(
        {
          group: 'notifications',
          type: 'success',
          text: 'Successfully saved schema.',
        },
        4000
      );
      navigateTo(this.redirectLink);
      this.makingRequest = false;
    },
    async deleteFactorySystemSchema() {
      try {
        this.makingRequest = true;
        await this.$axios.$delete(
          `/api/api/v2/admin/factory-system-schemas/${this.schemaId}`
        );
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully deleted schema.',
          },
          4000
        );
        navigateTo(this.redirectLink);
        this.makingRequest = false;
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to delete schema. Error: ${error}`,
          },
          4000
        );
        this.makingRequest = false;
      }
    },
    async createFactorySystemSchema() {
      try {
        this.schema = await this.$axios
          .$post('/api/api/v2/admin/factory-system-schemas', this.payload)
          .then((r) => r.data);
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to save schema. Error: ${error}`,
          },
          4000
        );
        this.makingRequest = false;
      }
    },
    async updateFactorySystemSchema() {
      try {
        await this.$axios
          .$put(
            `/api/api/v2/admin/factory-system-schemas/${this.schemaId}`,
            this.payload
          )
          .then((r) => r.data);
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to save schema. Error: ${error}`,
          },
          4000
        );
        this.makingRequest = false;
      }
    },
    async createDefaultPayload() {
      try {
        await this.$axios.$post(
          '/api/api/v2/admin/default-payloads',
          this.defaultPayloadData
        );
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to save default payload. Error: ${error}`,
          },
          4000
        );
        this.makingRequest = false;
      }
    },
    async updateDefaultPayload() {
      try {
        await this.$axios.$patch(
          `/api/api/v2/admin/default-payloads/${this.schema.default_payload.id}`,
          this.defaultPayloadData
        );
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to save default payload. Error: ${error}`,
          },
          4000
        );
        this.makingRequest = false;
      }
    },
  },
};
</script>
