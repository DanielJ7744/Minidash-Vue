<template>
  <div>
    <Breadcrumb
      current-page="Create Authorisation Type"
      :crumbs="{
        'Authorisation Types': '/admin/manage-authorisation-types',
      }"
    />

    <PageHeader>
      <template #title>Create Authorisation Type</template>
    </PageHeader>

    <hr />

    <AuthorisationTypesForm />
  </div>
</template>

<script>
definePageMeta({ middleware: 'patchworks' });

export default {
  name: 'Create',
};
</script>
