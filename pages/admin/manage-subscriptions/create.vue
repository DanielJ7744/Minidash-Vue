<template>
  <div>
    <Breadcrumb current-page="Create Subscription" :crumbs="{ 'Subscriptions': '/admin/manage-subscriptions' }" />
    <PageHeader>
      <template #title>Create Subscription</template>
      <template #description>Use this page to create a subscription.</template>
    </PageHeader>
    <SystemSubscriptionsForm
      @subscriptionCreated="redirectToSubscription"
    />
  </div>
</template>

<script>
definePageMeta({ middleware: 'patchworks' });

export default {
  name: 'Create',
  methods: {
    redirectToSubscriptions () {
      navigateTo({name: 'admin-manage-subscriptions'})
    },
    redirectToSubscription (subscription) {
      navigateTo({
        name: 'admin-manage-subscriptions-subscriptionId', 
        params: {'subscriptionId': subscription.id}
      })
    }
  }
}
</script>
