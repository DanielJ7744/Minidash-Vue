<template>
  <div>
    <Breadcrumb
      current-page="Edit"
      :crumbs="{
        Settings: '/settings',
        'Custom Scripts': '/settings/manage-scripts',
      }"
    />
    <PageHeader>
      <template #title>Edit custom script</template>
    </PageHeader>
    <hr />
    <PageSettingsCustomScriptsManageScriptForm :script-id="scriptId" />
  </div>
</template>

<script>
definePageMeta({
  middleware: ['custom-scripts'],
});

export default {
  name: 'ManageScript',
  setup() {
    return {
      route: useRoute(),
    };
  },
  computed: {
    scriptId() {
      return parseInt(this.route.params.scriptId);
    },
  },
};
</script>
