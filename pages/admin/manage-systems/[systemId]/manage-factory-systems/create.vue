<template>
  <div>
    <Breadcrumb
      current-page="Manage Factory System"
      :crumbs="{ 'Manage System': `/admin/manage-systems/${systemId}` }"
    />
    <div>
      <h1 class="page-title">Add Factory System</h1>

      <div>
        <p>
          Factory systems make up the from or to factory in a service and are
          used to define service templates.
        </p>
      </div>
    </div>
    <hr />
    <SystemFactorySystemsForm :system-id="systemId" />
  </div>
</template>

<script>
definePageMeta({
  can: 'manage systems',
});

export default {
  name: 'Create',
  setup() {
    return {
      route: useRoute(),
    };
  },
  computed: {
    systemId() {
      return this.route.params.systemId;
    },
  },
};
</script>
