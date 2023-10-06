import { defineStore } from 'pinia';

import type {
  Subscription,
  SubscriptionUsage,
  SubscriptionAllowance,
  SubscriptionResponse,
} from '~~/types/fabric/v2';

export const useSubscriptionStore = defineStore('subscription', {
  state: (): {
    plans: Subscription[];
    usage?: SubscriptionUsage;
    allowance?: SubscriptionAllowance;
  } => {
    return {
      usage: undefined,
      allowance: undefined,
      plans: [],
    };
  },

  getters: {
    // TODO: Improve the fallback return value/handling
    primarySubscription: (state): Subscription | { name: string } => {
      const fallback = {
        name: 'No active plan',
      };

      return (
        state.plans?.find(
          (s) => !s.upgrade && s.product_type !== 'bi_subscription'
        ) || fallback
      );
    },
    biPlan: (state): Subscription | undefined => {
      return state.plans.find(
        (plan) =>
          !plan.upgrade &&
          plan.product_type === 'bi_subscription' &&
          plan.business_insights
      );
    },
  },

  actions: {
    async initialise(): Promise<void> {
      try {
        const {
          data: plans,
          summary: { usage, allowance },
        } = await useFabric<SubscriptionResponse>(
          '/api/v2/company-subscriptions'
        );

        this.$patch({ plans, usage, allowance });
      } catch (error) {
        console.log(error);
      }
    },
  },
});
