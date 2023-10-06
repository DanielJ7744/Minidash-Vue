<template>
  <div v-if="$fetchState.pending || dataLoading" class="relative h-36">
    <UiLoading />
  </div>

  <div v-else-if="$fetchState.error" class="relative h-36">
    <UiError message="An error occurred." />
  </div>
  <div v-else>
    <Modal
      size="lg"
      id="entityManager"
      title="Manage Entity"
      :close-on-backdrop-click="false"
      overflow-hidden
    >
      <EntitiesEntityManager
        :system="system"
        :integration="integration"
        :type="inputType"
        :factory-system-schema="factorySystemSchemaSelected"
        :factory="factory"
        @entityDeleted="reloadFactorySystems()"
        @entitySaved="reloadFactorySystems()"
      />
    </Modal>
    <div class="overflow-y-auto">
      <div
        v-for="factorySystemSchema in factorySystemSchemas"
        :key="`factorySystemSchemaList+${factorySystemSchema.id}`"
        class="flex items-center justify-between py-2 border-b"
      >
        <p
          v-if="factorySystemSchema.factory_system.display_name"
          class="text-sm"
        >
          {{ factorySystemSchema.factory_system.display_name }}
        </p>
        <p v-else class="text-sm">
          {{ factorySystemSchema.factory_system.entity.name }}
        </p>
        <template v-if="factorySystemSchema.integration_id !== null">
          <button
            type="button"
            class="button button-secondary button-sm"
            @click="manageCustomEntity(factorySystemSchema)"
          >
            Manage
          </button>
        </template>
        <template v-else>
          <button
            type="button"
            class="button button-secondary button-sm"
            @click="downloadExamplePayload(factorySystemSchema)"
          >
            Download Example Payload
          </button>
        </template>
      </div>
    </div>
    <div class="mt-2">
      <button
        type="button"
        class="button button-primary button-sm"
        @click="addNewCustomEntity()"
      >
        Add custom entity
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import Systems from '@/enums/Systems';

export default {
  name: 'CustomEntities',
  props: {
    system: {
      type: Object,
      required: true,
    },
    integration: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      factorySystemSchemas: [],
      factorySystemSchemaSelected: null,
      dataLoading: false,
    };
  },
  async fetch() {
    await this.getFactorySystemSchemas(1);
  },
  computed: {
    inputType() {
      return this.system.name === Systems.INBOUND_API ? 'json' : 'csv';
    },
    factory() {
      if (!this.factorySystemSchemas.length) {
        return null;
      }
      return this.factorySystemSchemas
        .map(
          factorySystemSchema =>
            factorySystemSchema.factory_system.service_factory
        )
        .filter(
          (value, index, self) =>
            index ===
            self.findIndex(factorySystem => factorySystem.name === value.name)
        )[0];
    },
    origin() {
      const host = window.location.host;
      return host.slice(0, host.lastIndexOf('.'));
    },
  },
  methods: {
    ...mapActions(useUiStore, ['openModal']),
    async getFactorySystemSchemas() {
      try {
        this.factorySystemSchemas = await fetchAllPaginatedResults(
          this.$axios,
          '/api/api/v2/factory-system-schemas',
          {
            'filter[factorySystem.system_id]': this.system.id,
            'include': [
              'defaultPayload',
              'factorySystem.entity',
              'factorySystem.serviceFactory',
            ].join(','),
          }
        );
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed getting factory system schemas. Error: ${error}`,
          },
          4000
        );
      }
    },
    addNewCustomEntity() {
      this.factorySystemSchemaSelected = null;
      this.openModal('entityManager');
    },
    manageCustomEntity(factorySystemSchema) {
      this.factorySystemSchemaSelected = factorySystemSchema;
      this.openModal('entityManager');
    },
    async reloadFactorySystems() {
      try {
        this.dataLoading = true;
        this.factorySystemSchemas = [];
        await this.getFactorySystemSchemas();
        this.dataLoading = false;
      } catch (error) {
        this.dataLoading = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed loading factory systems. Error: ${error}`,
          },
          4000
        );
      }
    },
    downloadExamplePayload(factorySystemSchema) {
      if (!factorySystemSchema.default_payload) {
        return;
      }
      const link = document.createElement('a');
      link.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' +
          encodeURIComponent(factorySystemSchema.default_payload.payload)
      );
      const factorySystem = factorySystemSchema.factory_system;
      const fileName = `${
        factorySystem.direction
      }_${factorySystem.entity.name.toLowerCase()}.${
        factorySystemSchema.default_payload.type
      }`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
};
</script>
