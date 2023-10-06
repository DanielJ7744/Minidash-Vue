<template>
  <div>
    <Breadcrumb
      current-page="Manage Schema"
      :crumbs="{ 'Manage Default Schemas': redirectLink }"
    />
    <div>
      <div>
        <h1 class="page-title">Manage Schema</h1>

        <div>
          <p >
            A schema is used in the mapping page to build the UI.
          </p>
        </div>
      </div>

      <hr />

      <FactorySystemSchemasForm
        :redirect-link="redirectLink"
        :factory-system-id="factorySystemId"
        :schema-id="schemaId"
      />
    </div>
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
  computed: {
    factorySystemId() {
      return parseInt(this.route.params.factorySystemId);
    },
    systemId() {
      return parseInt(this.route.params.systemId);
    },
    schemaId() {
      return parseInt(this.route.params.schemaId);
    },
    redirectLink() {
      return `/admin/manage-systems/${this.systemId}/manage-system-defaults/${this.factorySystemId}/default-schema`;
    },
  },
};
</script>
