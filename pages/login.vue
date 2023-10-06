<template>
  <div class="flex flex-1 items-center justify-center">
    <div>
      <a
        href="https://www.wearepatchworks.com/"
        class="mb-2 ml-2 inline-flex items-center space-x-2 px-2 py-1 sm:ml-0"
      >
        <span class="icon icon--arrow-left text-lg" />
        <p class="text-sm text-gray-700">return to wearepatchworks.com</p>
      </a>
      <UiCard class="mx-auto max-w-lg py-4">
        <div class="space-y-3">
          <div>
            <h1 class="h4">Sign in to Patchworks</h1>
          </div>
          <form class="space-y-5" @submit.prevent="login">
            <div>
              <p class="text-xs">
                Please enter your login details. If you do not have an account
                for the Dashboard, please contact support your customer support
                representative for access.
              </p>
            </div>

            <div class="space-y-3">
              <div class="form-item">
                <input
                  id="email-address"
                  v-model="user.email"
                  type="email"
                  placeholder="Email Address"
                  autocomplete="email"
                  required
                  :disabled="disabled"
                />
              </div>

              <div class="form-item">
                <input
                  id="password"
                  v-model="user.password"
                  type="password"
                  placeholder="Password"
                  autocomplete="current-password"
                  required
                  :disabled="disabled"
                />
              </div>

              <div class="form-item">
                <button
                  class="button button-primary h-10 w-full"
                  type="submit"
                  :disabled="disabled"
                >
                  <svg
                    v-if="disabled"
                    class="h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span v-else> Sign in </span>
                </button>
              </div>
            </div>

            <div v-if="socialProviders.length" class="space-y-3">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300" />
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="bg-white px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div class="mt-1">
                <div
                  v-for="(provider, idx) in socialProviders"
                  :key="idx"
                  class="flex-1 text-center"
                >
                  <button
                    class="mx-auto inline-flex w-48 justify-center overflow-hidden rounded-sm bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-200 focus:ring-offset-1"
                    @click.prevent="sso(provider)"
                  >
                    <span class="sr-only"
                      >Sign in with {{ provider.name }}</span
                    >
                    <img
                      class="w-full"
                      :src="provider.image"
                      :alt="provider.name"
                    />
                  </button>
                </div>
              </div>
            </div>

            <hr />

            <div class="space-between flex items-center">
              <div class="form-item flex-1 text-center">
                <NuxtLink to="/reset-password" class="text-sm">
                  Forgot your password?
                </NuxtLink>
              </div>
              <div
                v-if="allowRegistration"
                class="form-item flex-1 text-center"
              >
                <NuxtLink to="/register" class="text-sm"> Register </NuxtLink>
              </div>
            </div>
          </form>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { notify } from 'notiwind';

definePageMeta({ auth: false, layout: 'guest' });

type SocialProvider = {
  name: string;
  image: string;
  active: boolean;
};

const authStore = useAuthStore();

const submitting = shallowRef(false);
const redirecting = shallowRef(false);
const allowRegistration = shallowRef(true);
const user = shallowReactive({
  email: '',
  password: '',
});

const disabled = computed(() => {
  return submitting.value || redirecting.value;
});

const socialProviders = computed((): SocialProvider[] => {
  return [
    { name: 'Google', image: '/images/google-sso.png', active: true },
  ].filter((provider) => provider.active);
});

const login = async () => {
  submitting.value = true;

  try {
    await authStore.login(user.email, user.password);

    navigateTo({ name: 'index' });
  } catch (error) {
    console.log(error);
    submitting.value = false;

    notify({
      group: 'notifications',
      type: 'error',
      text: 'Login failed, please check your email/password.',
    });
  }
};

const sso = async (provider: SocialProvider) => {
  const ssoUrl = useRuntimeConfig().public.fabricUrl;

  if (!ssoUrl) {
    console.log('SSO URL not found'); // eslint-disable-line no-console
    return;
  }

  redirecting.value = true;
  const providerUrl = `${ssoUrl}/sso/${provider.name.toLowerCase()}`;
  window.location.href = providerUrl;
};
</script>
