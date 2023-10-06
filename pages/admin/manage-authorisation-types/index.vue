<template>
  <div>
    <Breadcrumb
      current-page="Authorisation Types"
      :crumbs="{ Settings: '/settings' }"
    />

    <PageHeader>
      <template #title>Authorisation Types</template>
      <template #description>
        <p>
          Authorisation types are the ways that each connector is able to use to
          authenticate. For example, this might be oAuth2 or Basic
          Authorisation.
        </p>
        <p>
          The authorisation type is used when making system authorisation types
          to specify which authorisation type is available for each system.
        </p>
      </template>
      <template #actions v-if="$can('create authorisation-types')">
        <NuxtLink
          :to="{
            name: 'admin-manage-authorisation-types-create',
          }"
        >
          <button type="button" class="button button-primary">
            <span class="icon icon--add mr-3" />
            Create Authorisation Type
          </button>
        </NuxtLink>
      </template>
    </PageHeader>

    <hr />

    <TableAuthorisationTypes :authorisationTypes="authorisationTypes" />
  </div>
</template>

<script>
definePageMeta({
  middleware: ['patchworks'],
});

export default defineNuxtComponent({
  name: 'Index',
  async asyncData() {
    return {
      authorisationTypes: await useFabric('/api/v2/authorisation-types', {
        params: { perPage: 100 },
      }).then(r => r.data),
    };
  },
});
</script>
