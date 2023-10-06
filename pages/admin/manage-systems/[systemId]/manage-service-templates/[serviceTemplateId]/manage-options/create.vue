<template>
  <div>
    <Breadcrumb
      current-page="Create Service Template Option"
      :crumbs="{
        'Manage Service Template': `/admin/manage-systems/${systemId}/manage-service-templates/${serviceTemplateId}`,
      }"
    />
    <div>
      <h1 class="page-title">Create Service Template Option</h1>
    </div>
    <hr />
    <SystemServiceTemplateOptionsForm
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
