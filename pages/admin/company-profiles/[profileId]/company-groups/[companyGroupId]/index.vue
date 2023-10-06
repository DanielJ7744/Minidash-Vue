<template>
  <div>
    <Breadcrumb
      current-page="Manage Company Group"
      :crumbs="{ 'Company Profile': `/admin/company-profiles/${profileId}` }"
    />

    <PageHeader>
      <template #title>Manage Group</template>
    </PageHeader>

    <hr />
    <LazyLegacyPageSettingsCompanyProfilesProfileIdCompanyGroupsIntegrationForm
      :profile-id="profileId"
      :company-group-id="companyGroupId"
    />
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
    companyGroupId() {
      return this.route.params.companyGroupId;
    },
  },
};
</script>
