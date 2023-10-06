<template>
  <div>
    <Breadcrumb
      current-page="Create Service Template"
      :crumbs="{ 'Manage System': `/admin/manage-systems/${systemId}` }"
    />

    <PageHeader>
      <template #title>Create Service Template</template>
    </PageHeader>

    <hr />

    <SystemServiceTemplatesForm :system-id="systemId" />
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
