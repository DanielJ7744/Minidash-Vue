<template>
  <div>
    <Breadcrumb
      current-page="Manage Entity"
      :crumbs="{ 'All Entities': '/admin/manage-entities' }"
    />
    <div>
      <PageHeader>
        <template #title>Manage Entity</template>
      </PageHeader>
    </div>
    <hr />
    <SystemEntitiesForm :entity-id="entityId" />
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
  computed: {
    entityId() {
      return this.route.params.entityId;
    },
  },
};
</script>
