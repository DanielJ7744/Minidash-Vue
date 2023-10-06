<template>
  <div>
    <Breadcrumb :current-page="pageTitle" :crumbs="{ 'All Factories': '/admin/manage-factories' }" />
    <PageHeader>
      <template #title>{{ pageTitle }}</template>
    </PageHeader>
    <hr>
    <SystemFactoriesForm />
  </div>
</template>

<script>
definePageMeta({ middleware: 'patchworks' });

export default {
  name: 'Create',
  data() {
    return {
      pageTitle: "Create Factory"
    }
  },
}
</script>
