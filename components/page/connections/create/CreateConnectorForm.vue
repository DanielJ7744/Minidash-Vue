<template>
  <div class="max-w-xl mx-auto space-y-8">
    <FormSteps
      :steps="steps"
      :current="currentStep"
      :handle-click="(stepIdx) => (currentStep = stepIdx + 1)"
    >
      <template v-slot="{ idx, step }">
        {{ idx + 1 }} <span class="sr-only">{{ step.name }}</span>
      </template>
    </FormSteps>

    <!-- Information / Instructions -->
    <div class="space-y-5 text-center">
      <PageConnectionsCreateFormInformation :current-step="currentStep" />
    </div>

    <!-- Loading indicator -->
    <UiCard v-if="loading" class="max-w-md mx-auto">
      <div class="relative h-60">
        <UiLoading />
      </div>
    </UiCard>

    <!-- Error: No existing company groups -->
    <template v-else>
      <uiCard v-if="!integrations.length">
        <div class="py-6 space-y-3 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-8 mx-auto text-danger aspect-square"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>

          <div class="m-0 text-center">
            You currently do not have any company groups set up.
          </div>
          <div>
            <NuxtLink
              :to="{
                name: $patchworksAdmin()
                  ? 'admin-company-profiles'
                  : 'settings-company-profile-profileId',
                params: { profileId: $auth.user.company_id },
              }"
            >
              <button type="button" class="button button-primary">
                Configure a group
              </button>
            </NuxtLink>
          </div>
        </div>
      </uiCard>

      <!-- Form -->
      <UiCard v-else class="max-w-md mx-auto">
        <form class="py-3 space-y-10" @submit.prevent="handleSubmit">
          <div class="flex items-center space-x-5">
            <SystemIcon
              class="w-16 rounded aspect-square"
              :system-name="system.name"
            />

            <div>
              <p class="m-0 text-xs">
                Your selected system for this connector is
              </p>
              <p class="m-0 text-base font-medium text-gray-700">
                {{ system.name }}
              </p>
            </div>
          </div>
          <div>
            <PageConnectionsCreateBasicDetails
              v-if="currentStep === 1"
              :errors="errors"
              :initial="form"
              :system="system"
              :integrations="integrations"
              @update="updateForm"
            />
            <PageConnectionsCreateDateDetails
              v-if="currentStep === 2"
              :errors="errors"
              :initial="form"
              @update="updateForm"
            />
            <PageConnectionsCreateAuthenticationDetails
              v-if="currentStep === 3"
              :errors="errors"
              :initial="form"
              :system="system"
              @update="updateForm"
            />
            <PageConnectionsCreateCredentialsDetails
              v-if="currentStep === 4"
              :errors="errors"
              :initial="form"
              :system="system"
              @update="updateForm"
            />
          </div>

          <!-- Buttons -->
          <div class="flex flex-col items-center space-y-3">
            <FormLoadingButton
              class="w-full button-primary"
              type="submit"
              :loading="submitting"
              :disabled="submitting"
            >
              <template
                v-if="['oauth1', 'oauth2'].includes(form.authorisation_type)"
              >
                {{ currentStep == steps.length ? 'Authenticate' : 'Next step' }}
              </template>
              <template v-else>
                {{
                  currentStep == steps.length ? 'Create connector' : 'Next step'
                }}
              </template>
            </FormLoadingButton>
            <button
              class="w-full button button-secondary"
              :disabled="currentStep === 1"
              @click.prevent="
                currentStep = currentStep > 1 ? currentStep - 1 : 1
              "
            >
              Go back
            </button>
          </div>
        </form>
      </UiCard>

      <PageConnectionsCreateHelpDetails :system="system" />
    </template>
  </div>
</template>

<script>
const fieldSteps = {
  1: ['environment', 'connector_name', 'integration_id'],
  2: ['timezone', 'date_format'],
  3: ['authorisation_type'],
  4: ['credentials'],
};

export default {
  name: 'CreateConnectorForm',
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    system: {
      type: Object,
      required: false,
      default: null,
    },
    integrations: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      currentStep: 1,
      submitting: false,
      errors: {},
      steps: [
        { name: 'Basic details' },
        { name: 'Date format & timezone' },
        { name: 'Authentication' },
        { name: 'Credentials' },
      ],
      form: {
        system_id: this.system?.id,
        connector_name: '',
        integration_id: this.integrations?.[0]?.id,
        environment: 'live',
        environment_suffix: null,
        authorisation_type:
          this.system?.system_authorisation_types?.[0]?.authorisation_type
            ?.name,
        date_format: this.system?.date_format ?? 'Y-m-d H:i:s',
        timezone: this.system?.time_zone ?? dayjs.tz.guess(),
        credentials: {},
      },
    };
  },
  computed: {
    connectorAttributes() {
      return {
        ...this.form,
        environment: this.form.environment_suffix
          ? `${this.form.environment}_${this.form.environment_suffix}`
          : this.form.environment,
      };
    },
  },
  methods: {
    updateForm(details) {
      this.form = {
        ...this.form,
        ...details,
      };
    },
    async handleSubmit() {
      this.submitting = true;
      this.errors = {};

      try {
        if (
          this.currentStep === 4 &&
          ['oauth2', 'oauth1'].includes(this.form.authorisation_type)
        ) {
          await this.handleOauth();

          return;
        }

        await this.validate();

        const response = await this.$axios.$post('/api/api/v2/connectors', {
          ...this.connectorAttributes,
          precognitive: false,
        });

        navigateTo({
          name: 'connections-connectionId',
          params: {
            connectionId: response.data.id,
          },
        });

        this.$notify({
          group: 'notifications',
          type: 'success',
          text: 'Connector created!',
        });
      } catch (error) {
        if (error.response.status === 422) {
          return this.handleValidationErrors(
            error.response?.data?.errors || {}
          );
        }

        this.$notify({
          group: 'notifications',
          type: 'error',
          text: 'An error occurred, please try again.',
        });
      } finally {
        this.submitting = false;
      }
    },
    async handleOauth() {
      try {
        const url =
          this.form.authorisation_type === 'oauth1'
            ? '/api/api/v2/oauth-1'
            : '/api/api/v2/oauth-2';

        const response = await this.$axios.$post(url, this.connectorAttributes);

        window.location = response.redirect_url;
      } catch (error) {
        if (error.response.status === 422) {
          return this.handleValidationErrors(
            error.response?.data?.errors || {}
          );
        }

        this.$notify({
          group: 'notifications',
          type: 'error',
          text: 'An error occurred during the oAuth2 process. Please try again.',
        });
      }
    },
    async validate() {
      await this.$axios.$post('api/api/v2/connectors', {
        ...this.connectorAttributes,
        precognitive: true,
      });
    },
    handleValidationErrors(errors = null) {
      this.errors = errors || {};

      if (
        !this.currentStepContainsAnError() &&
        this.currentStep <= Object.keys(fieldSteps).length
      ) {
        this.errors = {};
        this.currentStep++;
      }
    },
    currentStepContainsAnError() {
      if (fieldSteps[this.currentStep]) {
        return Object.keys(this.errors).some((key) =>
          fieldSteps[this.currentStep].includes(key)
        );
      }
      if (this.errors) {
        return true;
      }
    },
  },
};
</script>
