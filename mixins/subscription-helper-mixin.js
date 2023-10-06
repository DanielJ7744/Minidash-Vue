import { mapActions, mapState } from 'pinia';
import { useSubscriptionStore } from '@/stores/subscription';

export const subscriptionHelperMixin = {
  computed: {
    ...mapState(useSubscriptionStore, ['plans']),
    hasBaseSubscriptionTier() {
      return !!this.plans.find((plan) => plan.name.toLowerCase() === 'base');
    },
  },
  methods: {
    ...mapActions(useUiStore, ['openModal']),
    checkForBaseSubscription(route) {
      if (this.hasBaseSubscriptionTier && !this.$patchworksAdmin()) {
        this.openModal('connectorSubscriptionWarning');
      } else {
        navigateTo(route);
      }
    },
  },
};
