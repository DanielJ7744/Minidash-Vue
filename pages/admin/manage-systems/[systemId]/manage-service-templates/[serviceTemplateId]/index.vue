<template>
  <div>
    <Breadcrumb
      current-page="Manage Service Template"
      :crumbs="{ 'Manage System': `/admin/manage-systems/${systemId}` }"
    />
    <PageHeader>
      <template #title>Manage Service Template</template>
    </PageHeader>

    <hr />
    <SystemServiceTemplatesForm
      :system-id="systemId"
      :service-template-id="serviceTemplateId"
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
    serviceTemplateId() {
      return this.route.params.serviceTemplateId;
    },
    systemId() {
      return this.route.params.systemId;
    },
  },
};
</script>
