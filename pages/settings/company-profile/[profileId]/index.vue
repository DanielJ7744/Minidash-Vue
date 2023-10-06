<template>
  <div>
    <Breadcrumb
      current-page="Manage Profile"
      :crumbs="{ Settings: '/settings' }"
    />
    <PageHeader>
      <template #title>Manage Profile</template>
    </PageHeader>

    <hr />
    <LegacyPageSettingsCompanyProfileForm :profile-id="profileId" />
  </div>
</template>

<script>
export default {
  name: 'Manage',
  setup() {
    return {
      route: useRoute(),
    };
  },

  computed: {
    profileId() {
      return this.route.params.profileId;
    },
  },
};
</script>
