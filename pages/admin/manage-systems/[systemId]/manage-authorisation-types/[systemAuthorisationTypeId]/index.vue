<template>
  <UiLoading
    v-if="$fetchState.pending"
    class="w-full"
    label="Loading Data..."
  />
  <div v-else-if="$fetchState.error" class="relative h-36">
    <UiError message="An error occurred." />
  </div>
  <div v-else>
    <Breadcrumb
      current-page="Manage System Authorisation Type"
      :crumbs="{ 'Manage System': `/admin/manage-systems/${systemId}` }"
    />
    <div>
      <h1 class="page-title">
        Manage
        {{ systemAuthorisationType.authorisation_type.name }} authentication for
        {{ system.name }}
      </h1>
    </div>
    <hr />
    <SystemSystemAuthorisationForm
      :system-id="systemId"
      :system-authorisation-type-id="systemAuthorisationTypeId"
    />
  </div>
</template>

<script>
definePageMeta({
  can: 'manage systems',
});

export default {
  name: 'Index',
  setup() {
    return {
      route: useRoute(),
    };
  },
  data() {
    return {
      systemAuthorisationType: null,
      system: null,
    };
  },
  async fetch() {
    this.systemAuthorisationType = await this.$axios
      .$get(
        `/api/api/v2/system-authorisation-types/${this.systemAuthorisationTypeId}?include=authorisationType`
      )
      .then((r) => r.data);
    this.system = await this.$axios
      .$get(`/api/api/v2/systems/${this.systemId}`)
      .then((r) => r.data);
  },
  computed: {
    systemId() {
      return this.route.params.systemId;
    },
    systemAuthorisationTypeId() {
      return this.route.params.systemAuthorisationTypeId;
    },
  },
};
</script>
