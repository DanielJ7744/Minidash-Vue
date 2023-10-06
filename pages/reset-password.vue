<template>
  <div class="flex w-full flex-1 items-center justify-center">
    <div class="w-full">
      <UiCard
        class="mx-auto max-w-lg"
        :title="isSettingFirstPassword ? 'Set' : 'Reset' + ' password'"
      >
        <form
          v-if="!form.token"
          class="w-full min-w-full space-y-5"
          :class="{ submitting: submitting }"
          @submit.prevent="handleForgotPassword"
        >
          <FormElement
            v-model="form.email"
            title="email"
            v-slot="{ inputProps, inputEvents }"
            label="Email"
            :disabled="!!route.query.email || submitting"
            required
          >
            <input type="email" v-bind="inputProps" v-on="inputEvents" />
          </FormElement>
          <div>
            <button
              type="submit"
              class="button button-primary mb-4"
              :disabled="submitting"
            >
              Send Password Reset Email
            </button>
            <div>
              <NuxtLink :to="{ name: 'login' }">
                <p class="text-sm">&#8592; return to login</p>
              </NuxtLink>
            </div>
          </div>
        </form>
        <form
          v-else
          class="space-y-5"
          :class="{ submitting: submitting }"
          @submit.prevent="handleSubmit"
        >
          <FormElement
            v-model="form.email"
            v-slot="{ inputProps, inputEvents }"
            title="email"
            label="Email"
            :disabled="!!route.query.email || submitting"
            required
          >
            <input
              class="w-full"
              type="email"
              v-bind="inputProps"
              v-on="inputEvents"
            />
          </FormElement>

          <FormElement
            v-model="form.password"
            v-slot="{ inputProps, inputEvents }"
            title="password"
            label="New password"
            :disabled="submitting"
            required
          >
            <input
              class="w-full"
              type="password"
              v-bind="inputProps"
              v-on="inputEvents"
            />
          </FormElement>

          <FormPasswordValidationStatus :errors="errors" />

          <FormElement
            v-model="form.password_confirmation"
            v-slot="{ inputProps, inputEvents }"
            title="password_confirmation"
            label="Confirm new password"
            :disabled="submitting"
            required
          >
            <input
              class="w-full"
              type="password"
              v-bind="inputProps"
              v-on="inputEvents"
            />
          </FormElement>

          <div v-if="errors.password && errors.password.length">
            <p class="text-danger-600 text-xs">
              {{
                errors.password.filter(
                  (error) =>
                    !['symbol', 'characters', 'uppercase', 'number'].some(
                      (excluded) => error.includes(excluded)
                    )
                )[0]
              }}
            </p>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <NuxtLink
                :to="{
                  name: 'login',
                }"
              >
                <p>&#8592; return to login</p>
              </NuxtLink>
            </div>
            <button
              type="submit"
              class="button button-primary"
              :disabled="submitting"
            >
              Save
            </button>
          </div>
        </form>
      </UiCard>
    </div>
  </div>
</template>

<script>
definePageMeta({ auth: false, layout: 'guest' });

export default {
  setup() {
    return {
      route: useRoute(),
    };
  },
  data() {
    return {
      submitting: false,
      errors: {},
      form: {
        email: this.route.query.email || '',
        token: this.route.query.token,
        password: '',
        password_confirmation: '',
      },
    };
  },
  computed: {
    isSettingFirstPassword() {
      return this.route.query['new-user'] === 'true';
    },
  },
  methods: {
    async handleForgotPassword() {
      this.submitting = true;

      try {
        await this.$axios.post('api/api/forgot-password', {
          email: this.form.email,
        });

        this.errors = {};

        this.$notify({
          group: 'notifications',
          type: 'success',
          text: 'Please check your inbox for a password reset email',
        });

        navigateTo({ name: 'login' });
      } catch (error) {
        if (error.response.status === 422) {
          this.errors = error.response.data?.errors || {};

          return;
        }

        if (error.response.status === 400) {
          this.errors = {};
          this.$notify({
            group: 'notifications',
            type: 'error',
            text:
              error.response.data?.message ||
              'An error occurred, please try again.',
          });

          return;
        }

        this.$notify({
          group: 'notifications',
          type: 'error',
          text: 'An error occurred, please contact support.',
        });
      } finally {
        this.submitting = false;
      }
    },
    async handleSubmit() {
      this.submitting = true;

      try {
        await this.$axios.post('/api/api/reset-password', this.form);

        this.errors = {};

        this.$notify({
          group: 'notifications',
          type: 'success',
          text: 'Password updated.',
        });

        navigateTo({ name: 'login' });
      } catch (error) {
        if (error.response.status === 422) {
          this.errors = error.response.data?.errors || {};

          return;
        }

        if (error.response.status === 400) {
          this.errors = {};
          this.$notify({
            group: 'notifications',
            type: 'error',
            text:
              error.response.data?.message ||
              'An error occurred, please try again.',
          });

          return;
        }

        this.$notify({
          group: 'notifications',
          type: 'error',
          text: 'An error occurred, please contact support.',
        });
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
