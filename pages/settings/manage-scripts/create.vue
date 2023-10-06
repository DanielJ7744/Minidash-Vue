<template>
  <div>
    <Breadcrumb
      current-page="Create Script"
      :crumbs="{
        'Settings': '/settings',
        'Custom Scripts': '/settings/manage-scripts',
      }"
    />

    <PageHeader>
      <template #title>Create Script</template>
    </PageHeader>

    <hr />

    <PageSettingsCustomScriptsManageScriptForm />
  </div>
</template>

<script>
definePageMeta({
  middleware: ['custom-scripts'],
});

export default {
  name: 'Create',
};
</script>
