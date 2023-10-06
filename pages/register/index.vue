<template>
  <div class="flex w-full flex-1 items-center justify-center">
    <UiCard class="mx-4 w-full max-w-4xl py-4">
      <div class="space-y-3">
        <div class="justify-between md:flex">
          <div>
            <h1 class="h5">Register with Patchworks</h1>
          </div>

          <nav class="flex items-center justify-center" aria-label="Progress">
            <p class="m-0 text-sm">Step {{ step }} of 3</p>
            <ol role="list" class="ml-8 flex items-center space-x-5">
              <li v-for="(i, idx) in 3" :key="i">
                <div
                  class="relative flex items-center justify-center"
                  aria-current="step"
                >
                  <span
                    v-if="step === idx + 1"
                    class="absolute flex h-5 w-5 p-px"
                    aria-hidden="true"
                  >
                    <span class="bg-accent-100 h-full w-full rounded-full" />
                  </span>
                  <span
                    :class="[
                      i <= step
                        ? 'bg-accent-600'
                        : 'bg-gray-200 hover:bg-gray-400',
                    ]"
                    class="relative block h-2.5 w-2.5 rounded-full"
                    aria-hidden="true"
                  />
                  <span class="sr-only">Step {{ i }}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <form class="space-y-5" @submit.prevent="next">
          <!-- Step One: User details -->
          <div v-if="step === 1" class="space-y-5 pt-4">
            <div v-if="!form.social_token" class="space-y-5">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300" />
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="bg-white px-2 text-gray-500">
                    Register socially
                  </span>
                </div>
              </div>

              <div class="flex-1 text-center">
                <div
                  v-for="(provider, idx) in socialProviders"
                  :key="idx"
                  class="flex-1"
                >
                  <button
                    type="button"
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

              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300" />
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="bg-white px-2 text-gray-500">
                    Or create an account
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div>
                <h4 class="h6">User details</h4>
                <hr />
              </div>
              <div v-if="form.user.avatar_url" class="w-full">
                <img
                  class="mx-auto aspect-square w-20 rounded"
                  :src="form.user.avatar_url"
                  alt="Avatar"
                />
              </div>

              <FormElement
                v-model="form.user.name"
                title="user.name"
                label="Name"
                class="mb-4"
                :errors="errors"
                v-slot="{ inputProps, inputEvents }"
                required
              >
                <input
                  id="name"
                  type="text"
                  maxlength="255"
                  v-bind="inputProps"
                  :disabled="inputsDisabled"
                  v-on="inputEvents"
                />
              </FormElement>
              <FormElement
                v-model="form.user.email"
                title="user.email"
                class="mb-2"
                label="Email"
                :errors="errors"
                required
                v-slot="{ inputProps, inputEvents }"
              >
                <input
                  id="email_address"
                  type="email"
                  maxlength="255"
                  v-bind="inputProps"
                  :disabled="inputsDisabled || !!form.social_token"
                  v-on="inputEvents"
                />
              </FormElement>
            </div>

            <div
              v-if="!form.social_token"
              class="xs:space-x-2 xs:flex xs:space-y-0 space-y-3"
            >
              <FormElement
                v-model="form.user.password"
                class="xs:w-1/2 w-full"
                title="user.password"
                label="Password"
                :errors="errors"
                v-slot="{ inputProps, inputEvents }"
                required
              >
                <input
                  id="password"
                  type="password"
                  maxlength="255"
                  v-bind="inputProps"
                  :disabled="inputsDisabled"
                  v-on="inputEvents"
                />
              </FormElement>
              <FormElement
                v-model="form.user.password_confirmation"
                class="xs:w-1/2 w-full"
                title="user.password_confirmation"
                label="Confirm password"
                :errors="errors"
                v-slot="{ inputProps, inputEvents }"
                required
              >
                <input
                  id="password_confirmation"
                  type="password"
                  maxlength="255"
                  v-bind="inputProps"
                  :disabled="inputsDisabled"
                  v-on="inputEvents"
                />
              </FormElement>
            </div>
          </div>

          <!-- Step Two: Company details -->
          <div v-if="step === 2" class="space-y-5 pt-4">
            <div class="space-y-3">
              <div>
                <h4>Company details</h4>
                <hr />
              </div>
              <FormElement
                v-model="form.company.name"
                title="company.name"
                label="Company name"
                :errors="errors"
                required
                v-slot="{ inputProps, inputEvents }"
              >
                <input
                  id="company_name"
                  type="text"
                  maxlength="255"
                  v-bind="inputProps"
                  :disabled="inputsDisabled"
                  v-on="inputEvents"
                />
              </FormElement>
              <FormElement
                v-model="form.company.company_email"
                title="company.company_email"
                label="Primary contact email"
                :errors="errors"
                required
                v-slot="{ inputProps, inputEvents }"
              >
                <input
                  id="company_email"
                  type="email"
                  maxlength="255"
                  v-bind="inputProps"
                  :disabled="inputsDisabled"
                  v-on="inputEvents"
                />
              </FormElement>

              <FormElement
                v-model="form.company.company_phone"
                title="company.company_phone"
                label="Company phone"
                :errors="errors"
                v-slot="{ inputProps, inputEvents }"
              >
                <input
                  id="company_phone"
                  type="text"
                  maxlength="255"
                  v-bind="inputProps"
                  :disabled="inputsDisabled"
                  v-on="inputEvents"
                />
              </FormElement>
              <FormElement
                v-model="form.company.company_website"
                title="company.company_website"
                label="Company website"
                :errors="errors"
                v-slot="{ inputProps, inputEvents }"
              >
                <input
                  id="company_website"
                  type="text"
                  maxlength="255"
                  v-bind="inputProps"
                  :disabled="inputsDisabled"
                  v-on="inputEvents"
                />
              </FormElement>
            </div>
          </div>

          <!-- Step Three: T&C -->
          <div v-if="step === 3" class="space-y-6">
            <div class="h-64 overflow-y-auto rounded border bg-gray-100 p-4">
              <ContentTermsConditions />
            </div>
            <div class="justify-between space-y-3 md:flex md:space-y-0">
              <div class="relative flex items-start">
                <div class="flex h-5 items-center">
                  <input
                    id="terms"
                    v-model="form.terms"
                    name="terms"
                    type="checkbox"
                  />
                </div>
                <div class="ml-3 text-sm">
                  <label for="comments">Terms and conditions</label>
                  <p>
                    I understand and agree to the terms and conditions of
                    service
                  </p>
                </div>
              </div>
              <div class="flex justify-end">
                <FormLoadingButton
                  type="submit"
                  class="button-primary w-full md:w-auto"
                  :loading="submitting"
                  :disabled="inputsDisabled || !form.terms"
                >
                  Create Patchworks account
                </FormLoadingButton>
              </div>
            </div>
          </div>

          <!-- Continue -->
          <div v-if="step < 3">
            <FormLoadingButton
              type="submit"
              class="button button-lg button-primary mx-auto flex h-12 w-full items-center justify-center"
              :loading="submitting || redirecting"
              :disabled="inputsDisabled"
            >
              Continue
            </FormLoadingButton>
          </div>
        </form>
        <div class="text-center">
          <p>
            <NuxtLink :to="{ name: 'login' }" class="text-sm">
              Return to login
            </NuxtLink>
          </p>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script>
definePageMeta({ auth: false, layout: 'guest' });

const fieldSteps = {
  1: ['user.name', 'user.email', 'user.password'],
  2: [
    'company.name',
    'company.company_email',
    'company.company_phone',
    'company.company_website',
  ],
  3: ['terms'],
};

export default {
  data() {
    return {
      redirecting: false,
      submitting: false,
      errors: {},
      step: 1,
      form: {
        terms: false,
        social_token: null,
        user: {
          email: '',
          name: '',
          avatar_url: '',
          password: '',
          password_confirmation: '',
        },
        company: {
          name: '',
          company_email: '',
          company_phone: '',
          company_website: '',
        },
      },
    };
  },
  computed: {
    socialProviders() {
      return [
        { name: 'Google', image: '/images/google-sso.png', active: true },
      ].filter((provider) => provider.active);
    },
    inputsDisabled() {
      return this.submitting || this.redirecting;
    },
  },
  watch: {
    // default the company email to the user's email
    'form.user.email'(input) {
      if (input && this.step === 1) {
        this.form.company.company_email = input;
      }
    },
  },
  mounted() {
    this.form.user.name = this.$route.query?.name || '';
    this.form.user.email = this.$route.query?.email || '';
    this.form.social_token = this.$route.query?.social_token || '';
    this.form.user.avatar_url = this.$route.query?.avatar_url || '';
    this.$router.replace({ query: null });
  },
  methods: {
    async next() {
      try {
        await this.attempt();
      } catch (error) {
        this.$notify({
          group: 'notifications',
          type: 'error',
          text: 'Something went wrong. Please try again.',
        });
      }
    },
    async attempt() {
      this.submitting = true;

      try {
        await this.$axios.$post('/api/api/v2/register', this.form);
        this.errors = {};

        navigateTo({ name: 'login' });
        this.$notify({
          group: 'notifications',
          type: 'success',
          text: 'Successfully registered! You can now login.',
        });
      } catch (error) {
        if (error.response.status !== 422) {
          throw error;
        }

        this.errors = error.response?.data?.errors || {};

        if (this.errors.social_token) {
          return this.restartRegistration();
        }

        console.log(
          'register',
          'currentStepContainsAnError',
          this.currentStepContainsAnError()
        );

        if (!this.currentStepContainsAnError() && this.step < 3) {
          this.errors = {};
          this.step++;

          return;
        }
      } finally {
        this.submitting = false;
      }
    },
    sso(provider) {
      const ssoUrl = useRuntimeConfig().public.fabricUrl;

      if (!ssoUrl) {
        console.log('SSO URL not found'); // eslint-disable-line no-console
        return;
      }

      this.redirecting = true;
      const providerUrl = `${ssoUrl}/sso/${provider.name.toLowerCase()}`;
      window.location.href = providerUrl;
    },
    currentStepContainsAnError() {
      return Object.keys(this.errors).some((key) =>
        fieldSteps[this.step].includes(key)
      );
    },
    restartRegistration(message = 'An error occurred, please try again') {
      this.step = 1;
      this.$notify({ group: 'notifications', type: 'error', text: message });
    },
  },
};
</script>
