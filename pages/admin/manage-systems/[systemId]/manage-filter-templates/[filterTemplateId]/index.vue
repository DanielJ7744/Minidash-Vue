<template>
  <div>
    <Breadcrumb
      current-page="Manage Filter Template"
      :crumbs="{ 'Manage System': `/admin/manage-systems/${systemId}` }"
    />
    <PageHeader>
      <template #title>Manage Filter Template</template>
    </PageHeader>

    <hr />
    <SystemFilterTemplatesForm
      :system-id="systemId"
      :filter-template-id="filterTemplateId"
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
    filterTemplateId() {
      return this.route.params.filterTemplateId;
    },
    systemId() {
      return this.route.params.systemId;
    },
  },
};
</script>
