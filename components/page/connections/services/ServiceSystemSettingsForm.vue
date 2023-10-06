<template>
  <div>
    <div class="mb-2">
      <label :for="`${direction}_source_id`">
        {{ direction === 'source' ? 'Source' : 'Destination' }} Connector
      </label>
      <input
        :id="`${direction}_source_id`"
        :value="connectorName"
        type="text"
        class="w-full"
        required
        disabled
      />
    </div>
    <div class="flex flex-row justify-between">
      <div class="flex-grow">
        <label :for="`${direction}_source_id`">
          {{ direction === 'source' ? 'Source' : 'Destination' }} System
        </label>
        <input
          :id="`${direction}_source_system`"
          :value="systemName"
          type="text"
          class="w-full"
          required
          disabled
        />
      </div>
      <div class="flex-grow ml-2">
        <label :for="`${direction}_source_from_environment`">
          Environment
        </label>
        <select
          v-model="selectedConnector"
          class="w-full bg-white h-9.5"
          :disabled="!configurable || integrationConnectors.length <= 1"
        >
          <option
            v-for="integrationConnector in integrationConnectors"
            :key="integrationConnector.id"
            :value="integrationConnector"
          >
            {{ integrationConnector.environment }}
          </option>
        </select>
      </div>
    </div>
    <FormElement
      v-if="!hideEntity"
      title="entity_id"
      label="Entity"
      :errors="errors"
      :required="!readOnly"
    >
      <EntitiesEntitySelector
        v-model="form.entityId"
        :entities="entities"
        :disabled="readOnly"
      />
    </FormElement>
  </div>
</template>

<script>
export default {
  name: 'ServiceSystemSettingsForm',
  props: {
    readOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
    hideEntity: {
      type: Boolean,
      required: false,
      default: false,
    },
    modelValue: {
      type: Object,
      required: true,
    },
    direction: {
      type: String,
      required: true,
    },
    systems: {
      type: Array,
      required: false,
      default: () => [],
    },
    entities: {
      type: Array,
      required: false,
      default: () => [],
    },
    environment: {
      type: String,
      required: true,
    },
    connector: {
      type: Object,
      required: true,
    },
    configurable: {
      type: Boolean,
      required: false,
      default: false,
    },
    errors: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  data() {
    return {
      selectedConnector: this.connector,
      connectors: null,
    };
  },
  async fetch() {
    this.connectors = await this.$axios
      .$get('/api/api/v2/connectors')
      .then(r => r.data);
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
    integrationConnectors() {
      if (this.$fetchState.pending) {
        return [this.connector];
      }

      return this.connectors
        .filter(connector => connector !== null)
        .filter(
          connector =>
            this.selectedConnector.integration.id === connector.integration.id
        )
        .filter(
          connector => this.selectedConnector.system.id === connector.system.id
        );
    },
    connectorName() {
      return (
        this.selectedConnector.credentials.store ??
        this.selectedConnector.connector_name ??
        this.selectedConnector.integration.name
      );
    },
    systemName() {
      return this.systems.find(
        system => parseInt(this.form.systemId) === parseInt(system.id)
      ).name;
    },
  },
  watch: {
    selectedConnector(newConnector) {
      this.$emit('changed-environment', newConnector.environment);
    },
  },
};
</script>
