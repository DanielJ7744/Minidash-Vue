<template>
  <div>
    <Breadcrumb
      current-page="Transform Maps"
      :crumbs="{ Settings: '/settings' }"
    />

    <PageHeader>
      <template #title>Transform Maps</template>
      <template #description>
        Transform maps are used to transform one value to another in the
        translate step of a service.
      </template>
      <template #actions>
        <NuxtLink :to="{ name: 'settings-transform-maps-create' }">
          <button class="button button-primary button-lg">
            <span class="icon icon--plus mr-2 text-xs"></span>
            Create Transform Map
          </button>
        </NuxtLink>
      </template>
    </PageHeader>

    <UiLoading v-if="$fetchState.pending" class="relative h-36" />
    <UiError
      v-else-if="$fetchState.error"
      class="relative h-36"
      message="An error occurred."
    />
    <div v-else>
      <div v-if="nonDefaultMaps.length > 0" class="mb-4">
        <h6 class="font-medium">Custom Transform Maps</h6>
        <div>
          <TableTransformMaps :transform-maps="nonDefaultMaps" />
        </div>
      </div>

      <div v-if="defaultMaps.length > 0">
        <h6 class="font-medium">Default Transform Maps</h6>
        <div>
          <TableTransformMaps :transform-maps="defaultMaps" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TransformMaps',
  data() {
    return {
      maps: [],
    };
  },
  async fetch() {
    this.maps = await fetchAllPaginatedResults(
      this.$axios,
      '/api/api/v1/transform-scripts/maps'
    );
  },
  computed: {
    defaultMaps() {
      return this.maps.filter((map) => map.company_id === 0);
    },
    nonDefaultMaps() {
      return this.maps.filter((map) => map.company_id !== 0);
    },
  },
};
</script>
