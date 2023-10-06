<template>
  <div>
    <Breadcrumb
      current-page="Edit Transform Map"
      :crumbs="{
        Settings: '/settings',
        'Transform Maps': '/settings/transform-maps',
      }"
    />

    <PageHeader>
      <template #title>Edit Transform Map</template>
      <template #description>
        Use the form below to edit a transform map
      </template>
      <template #actions>
        <NuxtLink
          :to="{
            name: 'settings-transform-maps-create',
            query: { map_id_to_clone: transformMapId },
          }"
        >
          <button class="button button-primary button-lg">
            Duplicate Map
          </button>
        </NuxtLink>
      </template>
    </PageHeader>

    <div>
      <LegacyPageSettingsTransformMapForm :map-id="transformMapId" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditTransformMap',
  setup() {
    return {
      route: useRoute(),
    };
  },
  computed: {
    transformMapId() {
      return parseInt(this.route.params.transformMapId);
    },
  },
};
</script>
