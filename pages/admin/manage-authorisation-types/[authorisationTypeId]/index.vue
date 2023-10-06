<template>
  <div>
    <Breadcrumb
      current-page="Manage Authorisation Type"
      :crumbs="{
        'All Authorisation Types': '/admin/manage-authorisation-types',
      }"
    />
    <div>
      <h1 class="page-title">Manage Authorisation Type</h1>
    </div>
    <hr />
    <AuthorisationTypesForm :authorisation-type-id="authorisationTypeId" />
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
    authorisationTypeId() {
      return this.route.params.authorisationTypeId;
    },
  },
};
</script>
