<template>
  <div>
    <Breadcrumb
      current-page="Manage Service Template Option"
      :crumbs="{
        'Manage Service Template': `/admin/manage-systems/${systemId}/manage-service-templates/${serviceTemplateId}`,
      }"
    />
    <div>
      <h1 class="page-title">Manage Service Template Option</h1>
    </div>
    <hr />
    <SystemServiceTemplateOptionsForm
      :system-id="systemId"
      :service-template-id="serviceTemplateId"
      :option-id="optionId"
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
    optionId() {
      return this.route.params.optionId;
    },
    systemId() {
      return this.route.params.systemId;
    },
  },
};
</script>
