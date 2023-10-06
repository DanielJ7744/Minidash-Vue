<template>
  <div class="page-container-fluid page-container space-y-5 divide-y">
    <div class="space-y-5">
      <div class="space-y-3 lg:flex lg:items-end lg:space-y-0">
        <div class="flex-1">
          <h1 class="m-0 text-2xl">Destination settings</h1>
        </div>
        <div>
          <SystemIcon2 :system="destinationSystem" />
        </div>
      </div>
    </div>

    <div>
      <form class="divide-y" @submit.prevent="handleSubmit">
        <UiTitledCard title="Destination Details">
          <PageConnectionsServicesServiceSystemSettingsForm
            v-if="destinationSystem"
            v-model="form.toOptions"
            read-only
            hide-entity
            direction="destination"
            :errors="errors"
            :systems="[destinationSystem]"
            :environment="service.to_environment"
            :connector="service.destination_connector"
            :configurable="true"
            @changed-environment="changedEnvironment"
          />
        </UiTitledCard>
        <UiTitledCard title="Data details">
          <PageConnectionsServicesDataSettings
            ref="dataSettings"
            v-model="form.toOptions"
            :errors="errors"
            hide-save-button
            direction="destination"
            :selected-factory-system="destinationFactorySystem"
            :selected-service-template="serviceTemplate"
          />
        </UiTitledCard>
        <div class="flex flex-1 justify-end space-x-2 py-5">
          <div>
            <button type="button" class="button button-secondary">
              Cancel
            </button>
            <button
              type="submit"
              class="button button-primary"
              :disabled="submitting"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
const EventBus = useLegacyEventBus();

export default {
  name: 'ServiceDestination',
  props: {
    service: {
      type: Object,
      required: false,
      default: null,
    },
    integration: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      form: {
        toEnvironment: this.$attrs.connector.environment,
        toOptions: {
          systemId: this.service.destination_system_id,
          timezone:
            this.service.to_options?.timezone ??
            this.service.destination_connector?.timezone,
          ...this.service.to_options,
        },
      },
      errors: {},
      destinationSystem: this.service?.destination_system ?? null,
      submitting: false,
    };
  },
  computed: {
    payload() {
      return {
        to_options: this.form.toOptions,
        to_environment: this.form.toEnvironment,
      };
    },
    serviceTemplate() {
      return this.service?.service_template;
    },
    destinationFactorySystem() {
      return this.service?.destination_factory_system;
    },
  },
  methods: {
    changedEnvironment(environment) {
      this.form.toEnvironment = environment;
    },
    optionsUpdated(updatedOptions) {
      this.form.toOptions = updatedOptions;
      const timezone =
        this.form.toOptions.timezone ??
        this.service.destination_connector?.timezone;
      if (timezone !== null) {
        this.form.toOptions.timezone = timezone;
      }
    },
    async handleSubmit() {
      if (this.$refs.dataSettings.editorToDisplay === 'options') {
        this.$refs.dataSettings.updateOptions();
      }

      this.submitting = true;
      try {
        if (this.$patchworksAdmin()) {
          await this.$axios.$patch(
            `/api/api/v2/admin/services/${this.service.id}`,
            this.payload
          );
          EventBus.emit('service:updated', this.service.id);
        } else {
          await this.$axios.$patch(
            `/api/api/v2/services/${this.service.id}`,
            this.payload
          );
          EventBus.emit('service:updated', this.service.id);
        }

        this.errors = {};
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Service updated successfully',
          },
          4000
        );
      } catch (error) {
        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors;
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: 'Please check the form for errors',
            },
            4000
          );
        } else {
          this.errors = {};
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: 'An error occurred while updating the service.',
            },
            4000
          );
        }
      }
      this.submitting = false;
    },
  },
};
</script>
