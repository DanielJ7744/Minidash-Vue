import { defineStore } from 'pinia';
import { getActivePinia } from 'pinia';

import type { Store } from 'pinia';
import type { User, Company } from '~~/types/fabric/v2';

export const useAuthStore = defineStore('auth', {
  state: (): {
    token: string | null;
    user: User | null;
    company: Company | null;
  } => {
    return {
      token: null,
      user: null,
      company: null,
    };
  },

  getters: {
    check: (state): boolean => !!state.user?.id,
  },

  actions: {
    async login(email: string, password: string): Promise<void> {
      const authToken = useCookie('authToken');

      const response = await useFabric<{ token: string }>('/api/v1/login', {
        method: 'POST',
        body: { email, password },
      });

      this.token = response.token;
      authToken.value = this.token;

      await this.initialise();
    },
    async initialise(): Promise<void> {
      const subscriptionStore = useSubscriptionStore();

      try {
        const [{ data: user }, { data: company }] = await Promise.all([
          useFabric<{ data: User }>('/api/v2/my/user'),
          useFabric<{ data: Company }>('/api/v2/my/company', {
            params: { include: 'settings' },
          }),
        ]);

        this.$patch({ user, company });

        await subscriptionStore.initialise();
      } catch (error) {
        this.logout(false);

        throw error;
      }
    },
    async logout(redirectToLogin: boolean = true): Promise<void> {
      const pinia = getActivePinia();

      // @ts-ignore
      const stores: Store[] = pinia?._s;

      stores.forEach((store) => store.$reset());

      if (redirectToLogin) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for a smooth transition

        navigateTo({ name: 'login' });
      }
    },
  },
});
