<template>
  <div>
    <Breadcrumb
      current-page="Manage Profile"
      :crumbs="{ 'Company Profiles': '/admin/company-profiles' }"
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
    previousRoute() {
      return this.$nuxt.context.from;
    },
  },
};
</script>
