<template>
  <div>
    <Breadcrumb current-page="Create Entity" :crumbs="{ 'All Entities': '/admin/manage-entities' }" />
    <div>
      <h1 class="page-title">
        Create Entity
      </h1>
    </div>
    <hr>
    <SystemEntitiesForm />
  </div>
</template>

<script>
definePageMeta({ middleware: 'patchworks' });

export default {
  name: 'Create'
}
</script>
