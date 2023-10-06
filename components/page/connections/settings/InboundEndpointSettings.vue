<template>
  <div
    class="space-y-5 divide-y page-container-fluid page-container"
  >
    <PageHeader>
      <template #title>Api settings</template>

      <template #actions>
        <SystemIcon2 :system="system" />
      </template>
    </PageHeader>

    <UiTitledCard title="Entities">
      <EntitiesCustomEntities :integration="integration" :system="system" />
    </UiTitledCard>
  </div>
</template>

<script>
export default {
  name: 'InboundEndpointSettings',
  props: {
    connector: {
      type: Object,
      required: false,
      default: null,
    },
    system: {
      type: Object,
      required: true,
    },
    integration: {
      type: Object,
      required: true,
    },
  },
};
</script>
