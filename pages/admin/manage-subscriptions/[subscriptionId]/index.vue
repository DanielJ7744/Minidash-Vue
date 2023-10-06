<template>
  <div>
    <Breadcrumb
      current-page="Update Subscription"
      :crumbs="{ Subscriptions: '/admin/manage-subscriptions' }"
    />
    <UiLoading v-if="$fetchState.pending" />
    <div v-else-if="$fetchState.error" class="relative h-36">
      <UiError message="An error occurred." />
    </div>
    <template v-else>
      <PageHeader>
        <template #title>{{ subscription.name }}</template>
        <template #description
          >Use this page to manage the {{ subscription.name }}
          {{ subscription.product_type_uc_words }}.</template
        >
      </PageHeader>
      <hr />
      <SystemSubscriptionsForm
        :subscription="subscription"
        @subscriptionUpdated="redirectToSubscriptions"
        @subscriptionDeleted="redirectToSubscriptions"
      />
    </template>
  </div>
</template>

<script>
definePageMeta({ middleware: 'patchworks' });

export default {
  name: 'Index',
  setup() {
    return {
      route: useRoute(),
    };
  },
  data() {
    return {
      subscription: null,
    };
  },
  async fetch() {
    this.subscription = await this.$axios
      .$get(`/api/api/v2/subscriptions/${this.subscriptionId}`)
      .then((r) => r.data);
  },
  computed: {
    subscriptionId() {
      return this.route.params.subscriptionId;
    },
  },
  methods: {
    redirectToSubscriptions() {
      navigateTo({ name: 'admin-manage-subscriptions' });
    },
    redirectToSubscription(subscription) {
      navigateTo({
        name: 'admin-manage-subscriptions-subscriptionId',
        params: {
          subscriptionId: subscription.id,
        },
      });
    },
  },
};
</script>
