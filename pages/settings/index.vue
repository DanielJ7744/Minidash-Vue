<template>
  <div>
    <PageHeader>
      <template #title>Settings</template>
    </PageHeader>

    <hr />

    <div class="settings-grid my-10">
      <PageSettingsMenuCard
        title="Account Summary"
        description="See account summary"
        :link="{ name: 'settings-account-summary' }"
        icon="icon--id-card"
      />
      <PageSettingsMenuCard
        title="Billing"
        description="Standard plan"
        :link="{ name: 'settings-billing' }"
        icon="icon--id-card"
      />
      <PageSettingsMenuCard
        title="My Account Settings"
        description="Update user profile"
        :link="{ name: 'settings-account' }"
        icon="icon--addresses"
      />
      <PageSettingsMenuCard
        title="My Company Profile"
        description="Update company profile"
        :link="{
          name: 'settings-company-profile-profileId',
          params: { profileId: $auth.company.id },
        }"
        icon="icon--office"
      />
      <PageSettingsMenuCard
        title="Notification Groups"
        description="Update notification groups"
        :link="{ name: 'settings-notification-groups' }"
        icon="icon--alarm"
      />
      <PageSettingsMenuCard
        title="Transform Maps"
        description="Create and update data transform maps"
        :link="{ name: 'settings-transform-maps' }"
        icon="icon--file-text"
      />
      <PageSettingsMenuCard
        title="Audit Logs"
        description="View audit logs"
        :link="{ name: 'settings-audit-logs' }"
        icon="icon--checklist"
      />
      <PageSettingsMenuCard
        v-if="$subscribedAny(plansWithCustomScripting)"
        title="Custom Scripts"
        description="Manage custom scripts"
        :link="{ name: 'settings-manage-scripts' }"
        icon="icon--code"
      />
    </div>
    <div v-if="$patchworksAdmin()" class="my-10">
      <h6 class="h6 mb-6">Admin Only</h6>
      <div class="settings-grid">
        <PageSettingsMenuCard
          title="Company Profiles"
          description="Create and update company profiles"
          :link="{ name: 'admin-company-profiles' }"
          icon="icon--office"
        />
        <PageSettingsMenuCard
          title="All Integrations"
          description="View all integrations"
          :link="{ name: 'admin-manage-integrations' }"
          icon="icon--link"
        />
        <PageSettingsMenuCard
          v-if="$can('manage systems')"
          title="Systems"
          description="View systems"
          :link="{ name: 'admin-manage-systems' }"
          icon="icon--parcel"
        />
        <PageSettingsMenuCard
          title="Entities"
          description="View entities"
          :link="{ name: 'admin-manage-entities' }"
          icon="icon--addresses"
        />
        <PageSettingsMenuCard
          title="Service Factories"
          description="View service factories"
          :link="{ name: 'admin-manage-factories' }"
          icon="icon--parcel"
        />
        <PageSettingsMenuCard
          title="Authorisation Types"
          description="View authorisation types"
          :link="{ name: 'admin-manage-authorisation-types' }"
          icon="icon--stack"
        />
        <PageSettingsMenuCard
          title="All Users"
          description="View all system users"
          :link="{ name: 'admin-manage-users' }"
          icon="icon--users"
        />
        <PageSettingsMenuCard
          title="Subscriptions"
          description="Manage subscription settings"
          :link="{ name: 'admin-manage-subscriptions' }"
          icon="icon--id-card"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { plansWithCustomScripting } from '@/lib/customScripting';
</script>

<style scoped>
.settings-grid {
  @apply grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-0;
}
</style>
