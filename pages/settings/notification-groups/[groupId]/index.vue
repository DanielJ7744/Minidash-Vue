<template>
  <div>
    <Breadcrumb
      current-page="Edit Notification Group"
      :crumbs="{
        Settings: '/settings',
        'Notification Groups': '/settings/notification-groups',
      }"
    />

    <PageHeader>
      <template #title>Edit Notification Group</template>
      <template #description>
        Use the form below to edit a notification group
      </template>
    </PageHeader>

    <div>
      <LegacyPageSettingsNotificationGroupForm :group-id="parseInt(groupId)" />
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  params: { groupId },
} = useRoute('settings-notification-groups-groupId');
</script>
