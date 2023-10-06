<template>
  <div>
    <Breadcrumb
      current-page="Default Schemas"
      :crumbs="{ 'Manage System': `/admin/manage-systems/${systemId}` }"
    />
    <UiLoading v-if="$fetchState.pending" label="Loading Data..." />
    <div v-else-if="$fetchState.error" class="relative h-36">
      <UiError message="An error occurred." />
    </div>
    <template v-else>
      <PageHeader>
        <template #title
          >Manage Default Schemas for {{ factorySystem.system.factory_name }}
          {{ factorySystem.direction }}
          {{ factorySystem.entity.name }}</template
        >
        <template #description>
          <p>
            Default schemas are used when creating services to build the mapping
            UI.
          </p></template
        >
        <template #actions>
          <button
            type="button"
            class="button button-primary"
            @click="addSchema()"
          >
            Create Schema
          </button>
        </template>
      </PageHeader>

      <hr />

      <div class="grid grid-cols-3 font-medium">
        <h5>Integration ID</h5>
        <h5>Schema</h5>
        <div />
      </div>

      <div
        v-for="(
          factorySystemSchema, factorySystemSchemasIndex
        ) in factorySystemSchemas"
        :key="factorySystemSchemasIndex"
        class="grid items-center grid-cols-3 py-1 text-base border-t"
      >
        <div>
          {{ formatIntegrationId(factorySystemSchema.integration_id) }}
        </div>
        <div>
          {{ formatSchema(factorySystemSchema.schema) }}
        </div>
        <div class="flex justify-center">
          <button
            type="button"
            class="button button-secondary"
            @click="manageSchema(factorySystemSchema)"
          >
            Manage
          </button>
        </div>
      </div>

      <hr />

      <div class="flex justify-center">
        <div v-if="schemaPage > 1">
          <button
            type="button"
            class="button button-secondary"
            @click="getPreviousPage()"
          >
            <span class="icon icon--arrow-left" />
          </button>
        </div>
        <div>Page {{ schemaPage }} of {{ lastSchemaPage }}</div>
        <div v-if="hasMoreSchemas">
          <button
            type="button"
            class="button button-secondary"
            @click="getNextPage()"
          >
            <span class="icon icon--arrow-right" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
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
      factorySystemSchemas: null,
      schemaPage: 1,
      lastSchemaPage: 1,
      hasMoreSchemas: false,
      loadingSchemas: false,
    };
  },
  async fetch() {
    this.factorySystem = await this.$axios
      .$get(
        `/api/api/v2/factory-systems/${this.factorySystemId}?include=serviceFactory,system,entity`
      )
      .then((r) => r.data);
    await this.getMoreFactorySystemSchemas(this.schemaPage);
  },
  computed: {
    factorySystemId() {
      return this.route.params.factorySystemId;
    },
    systemId() {
      return this.route.params.systemId;
    },
  },
  methods: {
    async getNextPage() {
      this.schemaPage++;
      await this.getMoreFactorySystemSchemas(this.schemaPage);
    },
    async getPreviousPage() {
      this.schemaPage--;
      await this.getMoreFactorySystemSchemas(this.schemaPage);
    },
    async getMoreFactorySystemSchemas(pageNumber) {
      try {
        this.loadingSchemas = true;
        const schemaResponse = await this.$axios
          .$get(
            `/api/api/v2/admin/factory-system-schemas?page=${this.schemaPage}&filter[factory_system_id]=${this.factorySystemId}`
          )
          .then((r) => r);
        this.factorySystemSchemas = schemaResponse.data;
        this.hasMoreSchemaPages(schemaResponse);
        this.loadingSchemas = false;
      } catch (error) {
        this.loadingSchemas = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed loading more schemas. Error: ${error}`,
          },
          4000
        );
      }
    },
    hasMoreSchemaPages(response) {
      if (response.meta.last_page > this.schemaPage) {
        this.hasMoreSchemas = true;
        this.lastSchemaPage = response.meta.last_page;
      }
    },
    formatIntegrationId(value) {
      return value === null ? 'Global' : value;
    },
    formatSchema(value) {
      return `${value.substring(0, 200)} ...`;
    },
    addSchema() {
      const params = {
        systemId: this.systemId,
        factorySystemId: this.factorySystemId,
      };
      navigateTo({
        name: 'admin-manage-systems-systemId-manage-system-defaults-factorySystemId-default-schema-create',
        params,
      });
    },
    manageSchema(schema) {
      const params = {
        systemId: this.systemId,
        factorySystemId: this.factorySystemId,
        schemaId: schema.id,
        schema,
      };
      navigateTo({
        name: 'admin-manage-systems-systemId-manage-system-defaults-factorySystemId-default-schema-schemaId',
        params,
      });
    },
  },
};
</script>
