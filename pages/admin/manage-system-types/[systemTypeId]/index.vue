<template>
  <div>
    <Breadcrumb
      current-page="Manage System Type"
      :crumbs="{ 'All System Types': '/admin/manage-system-types' }"
    />
    <div>
      <h1 class="page-title">Manage System Type</h1>
    </div>
    <hr />
    <SystemTypesForm :system-type-id="systemTypeId" />
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
    systemTypeId() {
      return this.route.params.systemTypeId;
    },
  },
};
</script>
