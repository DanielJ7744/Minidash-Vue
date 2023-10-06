<template>
  <div>
    <Breadcrumb current-page="Create Notification Group" :crumbs="{ Settings: '/settings', 'Notification Groups': '/settings/notification-groups' }" />

    <PageHeader>
      <template #title>Create Notification Group</template>
      <template #description>
        Use the form below to create a notification group
      </template>
    </PageHeader>

    <LegacyPageSettingsNotificationGroupForm />
  </div>
</template>
