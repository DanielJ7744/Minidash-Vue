<template>
  <div>
    <PageHeader>
      <template #title>Sync Reports</template>
      <template #description>
        <p>
          View all the data synced by your Patchworks application, and whether
          syncs were successful.
        </p>
      </template>
    </PageHeader>

    <hr />
    <EntitiesTable :initial-filters="filters" />
  </div>
</template>

<script>
export default {
  name: 'SyncReports',
  data: () => ({
    filters: {
      days: 5,
    },
  }),
};
</script>
