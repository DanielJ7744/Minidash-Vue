<template>
  <div>
    <Breadcrumb
      current-page="Add New Company Group"
      :crumbs="{ 'Company Profile': `/admin/company-profiles/${profileId}` }"
    />
    <div>
      <h1>Create Group</h1>
    </div>
    <hr />
    <LegacyPageSettingsCompany-profilesProfileIdCompany-groupsIntegrationForm
      :profile-id="profileId"
    />
  </div>
</template>

<script>
export default {
  name: 'Create',
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
