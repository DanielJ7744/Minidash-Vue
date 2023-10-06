<template>
  <div class="flex flex-1 items-center justify-center">
    <UiCard>
      <div v-if="code">
        <div class="flex min-h-full flex-col py-12">
          <div
            class="mx-auto flex w-full max-w-7xl flex-grow flex-col justify-center px-4 sm:px-6 lg:px-8"
          >
            <div class="space-y-12">
              <div class="text-center">
                <p
                  class="text-primary text-sm font-medium uppercase tracking-wide"
                >
                  {{ code }} error
                </p>
                <h1 class="h2">
                  {{ title }}
                </h1>
                <p class="mt-2 text-base text-gray-500">
                  {{ message }}
                </p>
                <div class="mt-6">
                  <NuxtLink
                    :to="{ name: 'login' }"
                    class="text-primary hover:text-primary-600 text-base font-medium"
                  >
                    Returning to login in {{ delay }} seconds<span
                      aria-hidden="true"
                    >
                      &rarr;</span
                    >
                  </NuxtLink>
                </div>
              </div>
              <footer class="mx-auto w-full flex-shrink-0 px-4 sm:px-6 lg:px-8">
                <nav class="flex justify-center space-x-4">
                  <NuxtLink
                    :to="{ name: 'login' }"
                    class="text-sm font-medium text-gray-500 hover:text-gray-600"
                  >
                    Login
                  </NuxtLink>
                  <span
                    class="inline-block border-l border-gray-300"
                    aria-hidden="true"
                  />
                  <!-- <NuxtLink
                    :to="{ name: 'reset-password' }"
                    class="text-sm font-medium text-gray-500 hover:text-gray-600"
                  >
                    Forgot Password
                  </NuxtLink> -->
                </nav>
              </footer>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="relative mx-auto h-8 w-12">
        <UiLoading />
      </div>
    </UiCard>
  </div>
</template>

<script>
definePageMeta({ auth: false, layout: 'guest' });

export default {
  name: 'SsoCallback',
  data: () => ({
    delay: 20,
    code: null,
    title: null,
    message: true,
  }),
  async mounted() {
    const { token, code, title, message } = this.$route.query;

    if (token && !code) {
      console.log('handling token');
      await this.handleToken(token);
      return;
    }
    this.handleError({ code, title, message });
  },
  methods: {
    async handleToken(token) {
      const authStore = useAuthStore();

      await authStore.logout(false);
      try {
        const authToken = useCookie('authToken');

        authToken.value = token;
        authStore.token = token;

        await authStore.initialise();

        navigateTo({ name: 'index' });
      } catch (e) {
        console.error(e); // eslint-disable-line no-console

        this.handleError();
      }
    },
    handleError({ code, title, message }) {
      this.code = code || 500;
      this.title = title || 'An error occurred';
      this.message = message || 'Please try an alternative login method';

      setTimeout(() => {
        navigateTo({ name: 'login' });
      }, this.delay * 1000);
    },
  },
};
</script>
