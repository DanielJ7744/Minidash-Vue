<template>
  <div>
    <Breadcrumb current-page="Manage Users" :crumbs="{ Settings: '/settings' }" />
    <PageHeader>
      <template #title>{{ pageTitle }}</template>
    </PageHeader>
    <TableAllUsers />
  </div>
</template>

<script>
definePageMeta({ middleware: 'patchworks' });
export default {
  name: 'Index',
  data () {
    return {
      pageTitle: 'Manage Users',
    }
  }
}
</script>

