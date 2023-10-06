<template>
  <div>
    <Breadcrumb
      current-page="Manage Integrations"
      :crumbs="{ Settings: '/settings' }"
    />
    <PageHeader>
      <template #title>Manage Integrations</template>
    </PageHeader>
    <TableIntegrations />
  </div>
</template>

<script>
definePageMeta({ middleware: 'patchworks' });

export default {
  name: 'Index',
};
</script>
