<template>
  <div>
    <Breadcrumb
      current-page="Create System"
      :crumbs="{ 'Manage System': `/admin/manage-systems/${systemId}` }"
    />

    <PageHeader>
      <template #title>Create a new system authorisation type</template>
    </PageHeader>

    <hr />

    <SystemSystemAuthorisationForm :system-id="systemId" />
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
