<template>
  <div>
    <Breadcrumb
      current-page="Create Filter Field"
      :crumbs="{ 'Manage System': `/admin/manage-systems/${systemId}` }"
    />

    <PageHeader>
      <template #title>Create Filter Field</template>
    </PageHeader>
    <hr />
    <SystemFilterFieldsForm :system-id="systemId" />
  </div>
</template>

<script>
definePageMeta({
  can: 'manage systems',
});

export default {
  name: 'Create',
  setup() {
    return {
      route: useRoute(),
    };
  },
  computed: {
    systemId() {
      return this.route.params.systemId;
    },
  },
};
</script>
