<template>
  <div>
    <Breadcrumb
      current-page="Manage Payment Map"
      :crumbs="{
        'Company Group': `/admin/company-profiles/${profileId}/company-groups/${companyGroupId}`,
      }"
    />
    <UiLoading v-if="$fetchState.pending" class="relative h-36" />
    <UiError
      v-else-if="$fetchState.error"
      class="relative h-36"
      message="An error occurred."
    />
    <PageServicesMappingEditMapping
      v-else
      type="payment map"
      :integration="integration"
      :payment-map="paymentMap"
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
  data() {
    return {
      integration: null,
      paymentMap: null,
    };
  },
  async fetch() {
    this.integration = this.$patchworksAdmin()
      ? await this.$axios
          .$get(`/api/api/v2/admin/integrations/${this.companyGroupId}`)
          .then((r) => r.data)
      : await this.$axios
          .$get(`/api/api/v2/integrations/${this.companyGroupId}`)
          .then((r) => r.data);
    this.paymentMap = await this.$axios
      .$get(`/api/api/v2/integrations/${this.integration.id}/payment-maps`)
      .then((r) => r.data);
  },
  computed: {
    companyGroupId() {
      return this.route.params.companyGroupId;
    },
    profileId() {
      return this.route.params.profileId;
    },
  },
};
</script>
