<template>
  <div>
    <Breadcrumb
      current-page="Manage Filter Field"
      :crumbs="{ 'Manage System': `/admin/manage-systems/${systemId}` }"
    />
    <PageHeader>
      <template #title>Manage Filter Field</template>
    </PageHeader>

    <hr />
    <SystemFilterFieldsForm
      :system-id="systemId"
      :filter-field-id="filterFieldId"
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
    filterFieldId() {
      return this.route.params.filterFieldId;
    },
    systemId() {
      return this.route.params.systemId;
    },
  },
};
</script>
