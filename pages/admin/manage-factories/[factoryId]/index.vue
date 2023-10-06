<template>
  <div>
    <Breadcrumb
      :current-page="pageTitle"
      :crumbs="{ 'All Factories': '/admin/manage-factories' }"
    />
    <div>
      <PageHeader>
        <template #title>{{ pageTitle }}</template>
      </PageHeader>
    </div>
    <hr />
    <SystemFactoriesForm :factory-id="factoryId" />
  </div>
</template>

<script>
definePageMeta({ middleware: 'patchworks' });

export default {
  name: 'Index',
  setup() {
    return {
      route: useRoute(),
    };
  },
  data() {
    return {
      pageTitle: 'Manage Factory',
    };
  },
  computed: {
    factoryId() {
      return this.route.params.factoryId;
    },
  },
};
</script>
