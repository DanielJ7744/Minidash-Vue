<template>
  <div>
    <Breadcrumb
      current-page="Create System"
      :crumbs="{ Settings: '/admin/manage-systems' }"
    />
    <div>
      <h1 class="page-title">Create System</h1>
      <div>
        <p >Use this page to create a system.</p>
      </div>
    </div>
    <hr />
    <SystemManageSystemForm
      @systemCreated="redirectToSystem"
      @systemDeleted="redirectToSystems"
      @systemUpdated="redirectToSystems"
      @cancel="redirectToSystems"
    />
  </div>
</template>

<script>
definePageMeta({
  can: 'manage systems',
});

export default {
  name: 'Create',
  methods: {
    redirectToSystems() {
      navigateTo({ name: 'admin-manage-systems' });
    },
    redirectToSystem(system) {
      navigateTo({
        name: 'admin-manage-systems-systemId',
        params: { systemId: system.id },
      });
    },
  },
};
</script>
