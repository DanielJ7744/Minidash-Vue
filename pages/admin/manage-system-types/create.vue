<template>
  <div>
    <Breadcrumb current-page="Create System Type" :crumbs="{ 'All System Types': '/admin/manage-system-types' }" />
    <div>
      <h1 class="page-title">
        Create System Type
      </h1>
    </div>
    <hr>
    <SystemTypesForm />
  </div>
</template>

<script>
definePageMeta({ middleware: 'patchworks' });

export default {
  name: 'Create'
}
</script>
