<template>
  <div>
    <Breadcrumb
      current-page="Manage Subscriptions"
      :crumbs="{ Settings: '/settings' }"
    />
    <PageHeader>
      <template #title>Manage Subscriptions</template>
      <template #description
        >Subscriptions define resource access and usage for a subscribed
        company.</template
      >
      <template #actions v-if="$patchworksAdmin()">
        <NuxtLink
          :to="{
            name: 'admin-manage-subscriptions-create',
          }"
        >
          <button type="button" class="button button-primary ml-2">
            <span class="icon icon--plus mr-2" />
            Create Subscription
          </button>
        </NuxtLink>
      </template>
    </PageHeader>
    <div>
      <TableCompanySubscriptions />
    </div>
  </div>
</template>

<script>
definePageMeta({ middleware: 'patchworks' });

export default {
  name: 'Index',
};
</script>
