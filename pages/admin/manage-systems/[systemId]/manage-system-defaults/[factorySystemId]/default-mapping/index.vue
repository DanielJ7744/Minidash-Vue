<template>
  <div>
    <Breadcrumb
      current-page="Manage Default Mapping"
      :crumbs="{ 'Manage System': `/admin/manage-systems/${systemId}` }"
    />
    <UiLoading
      v-if="$fetchState.pending || makingRequest"
      class="relative h-36"
    />
    <UiError
      v-else-if="$fetchState.error"
      class="relative h-36"
      message="An error occurred."
    />
    <form v-else @submit.prevent="sendSaveMappingRequest()">
      <div>
        <PageHeader>
          <template #title>
            Manage Default Mappings for
            {{ factorySystem.system.factory_name }}
            {{ factorySystem.direction }}
            {{ factorySystem.service_factory.name }}
            {{ factorySystem.entity.name }}
          </template>
          <template #description>
            <p>
              Default mappings are used when creating services to translate data
              from one system to another.
            </p>
            <p>
              Note: Default mapping names have updated. If you think that a
              mapping file is missing, please click "Retrieve old mapping file"
              and re-save it.
            </p>
          </template>
          <template #actions>
            <button
              type="button"
              class="button button-primary"
              @click="retrieveOldMappingFile"
            >
              Retrieve old mapping file
            </button>
          </template>
        </PageHeader>
      </div>

      <JsonEditor v-model="mappingData" hide-button />

      <div class="flex justify-between mt-2">
        <button
          type="button"
          class="button button-secondary"
          @click="
            navigateTo({
              name: 'admin-manage-systems-systemId',
              params: { systemId },
            })
          "
        >
          Cancel
        </button>
        <button type="submit" class="button button-primary">Save</button>
      </div>
    </form>
  </div>
</template>

<script>
import { getMapping } from '~/lib/mapping';

definePageMeta({
  can: 'manage systems',
});

export default {
  name: 'Index',
  setup() {
    return {
      route: useRoute(),
    };
  },
  data() {
    return {
      factorySystem: null,
      mappingData: {},
      makingRequest: false,
    };
  },
  async fetch() {
    this.factorySystem = await this.$axios
      .$get(
        `/api/api/v2/factory-systems/${this.factorySystemId}?include=serviceFactory,system,entity`
      )
      .then((r) => r.data);
    try {
      this.mappingData = await getMapping(
        this.$axios,
        `default_${this.mappingName}`
      ).then((r) => JSON.parse(r.data.content));
    } catch (error) {
      this.mappingData = {};
      this.$notify(
        {
          group: 'notifications',
          type: 'error',
          text: `Failed to get mapping file: ${error}.`,
        },
        4000
      );
    }
  },
  computed: {
    factorySystemId() {
      return this.route.params.factorySystemId;
    },
    systemId() {
      return this.route.params.systemId;
    },
    oldMappingName() {
      return `${this.factorySystem.system.factory_name.toLowerCase()}_${this.factorySystem.direction.toLowerCase()}_${this.factorySystem.entity.name.toLowerCase()}`;
    },
    mappingName() {
      return `${this.factorySystem.system.factory_name.toLowerCase()}_${this.factorySystem.direction.toLowerCase()}_${this.factorySystem.service_factory.name.toLowerCase()}_${this.factorySystem.entity.name.toLowerCase()}`;
    },
    mappingPayload() {
      return {
        username_override: 'default',
        search_field: `default_${this.mappingName}`,
        mapping_name: this.mappingName,
        content: JSON.stringify(this.mappingData),
      };
    },
    factorySystemPayload() {
      return {
        default_map_name: `default_${this.mappingName}`,
      };
    },
  },
  methods: {
    async retrieveOldMappingFile() {
      try {
        this.makingRequest = true;
        this.mappingData = await getMapping(
          this.$axios,
          `default_${this.oldMappingName}`
        ).then((r) => JSON.parse(r.data.content));
        this.makingRequest = false;
      } catch (error) {
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to get old mapping file: ${error}.`,
          },
          4000
        );
      }
    },
    async sendSaveMappingRequest() {
      try {
        this.makingRequest = true;
        await this.$axios.$post('/api/api/v2/mappings', this.mappingPayload);
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved mapping file.',
          },
          4000
        );
        await this.updateFactorySystem();
      } catch (error) {
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed saving mapping: ${error}.`,
          },
          4000
        );
      }
    },
    async updateFactorySystem() {
      try {
        await this.$axios.$put(
          `/api/api/v2/admin/factory-systems/${this.factorySystem.id}`,
          this.factorySystemPayload
        );
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved factory system.',
          },
          4000
        );
        navigateTo({
          name: 'admin-manage-systems-systemId',
          params: {
            systemId: this.systemId,
          },
        });
      } catch (error) {
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed saving factory system: ${error}.`,
          },
          4000
        );
      }
    },
  },
};
</script>
