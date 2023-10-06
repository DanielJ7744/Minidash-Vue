<template>
  <div>
    <PageHeader>
      <template #title>Settings</template>
      <template #actions>
        <SystemIcon2 :system="system" />
      </template>
    </PageHeader>

    <hr />

    <UiTitledCard title="Access">
      <template #content>
        <TableUsers :company-id="integration.company_id" manage-bi />
      </template>
    </UiTitledCard>
  </div>
</template>

<script>
export default {
  name: 'BiSettings',
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
