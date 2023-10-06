<template>
  <div>
    <Breadcrumb
      current-page="Manage Factory System"
      :crumbs="{ 'Manage System': `/admin/manage-systems/${systemId}` }"
    />
    <PageHeader>
      <template #title>Manage Factory System</template>
      <template #description>
        <p>
          Factory systems make up the from or to factory in a service and are
          used to define service templates.
        </p>
      </template>
    </PageHeader>

    <hr />

    <SystemFactorySystemsForm
      :system-id="systemId"
      :factory-system-id="factorySystemId"
    />
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
      return this.route.params.factorySystemId;
    },
    systemId() {
      return this.route.params.systemId;
    },
  },
};
</script>
