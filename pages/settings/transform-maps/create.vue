<template>
  <div>
    <Breadcrumb
      current-page="Create Transform Map"
      :crumbs="{
        Settings: '/settings',
        'Transform Maps': '/settings/transform-maps',
      }"
    />

    <PageHeader>
      <template #title>Create Transform Map</template>
      <template #description>
        Use the form below to create a transform map.
      </template>
    </PageHeader>

    <LegacyPageSettingsTransformMapForm
      :map-id-to-duplicate="transformMapIdToClone"
    />
  </div>
</template>

<script>
export default {
  name: 'CreateTransformMap',
  setup() {
    return {
      route: useRoute(),
    };
  },
  computed: {
    transformMapIdToClone() {
      return parseInt(this.route.query.map_id_to_clone);
    },
  },
};
</script>
