<template>
  <Breadcrumb
    current-page="Notification Groups"
    :crumbs="{ Settings: '/settings' }"
  />

  <PageHeader>
    <template #title>Notification Groups</template>
    <template #description>
      Notification groups are useful when you need to send alerts to multiple
      users
    </template>
    <template #actions>
      <NuxtLink :to="{ name: 'settings-notification-groups-create' }">
        <button class="button button-primary">
          <span class="text-xs icon icon--plus mr-2"></span>
          Create Notification Group
        </button>
      </NuxtLink>
    </template>
  </PageHeader>
  <TableNotificationGroups />
</template>
