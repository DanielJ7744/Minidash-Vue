<template>
  <div>
    <Breadcrumb
      current-page="Manage Factory System Service Option"
      :crumbs="{
        'Manage Factory System': `/admin/manage-systems/${systemId}/manage-factory-systems/${factorySystemId}`,
      }"
    />
    <PageHeader>
      <template #title>Manage Factory System Service Option</template>
    </PageHeader>
    <SystemFactorySystemServiceOptionsForm
      :system-id="systemId"
      :factory-system-id="factorySystemId"
      :factory-system-service-option-id="factorySystemServiceOptionId"
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
    factorySystemServiceOptionId() {
      return this.route.params.factorySystemServiceOptionId;
    },
    systemId() {
      return this.route.params.systemId;
    },
  },
};
</script>
