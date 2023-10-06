<template>
  <div class="page-container-fluid page-container space-y-5 divide-y">
    <div class="space-y-5">
      <div class="space-y-3 lg:flex lg:items-end lg:space-y-0">
        <div class="flex-1">
          <h1 class="m-0 text-2xl">Source settings</h1>
        </div>
        <div>
          <SystemIcon2 :system="sourceSystem" />
        </div>
      </div>
    </div>

    <form class="divide-y" @submit.prevent="handleSubmit">
      <UiTitledCard title="Source Details">
        <PageConnectionsServicesServiceSystemSettingsForm
          v-model="form.fromOptions"
          read-only
          hide-entity
          direction="source"
          :errors="errors"
          :systems="[sourceSystem]"
          :environment="service.from_environment"
          :connector="service.source_connector"
          :configurable="true"
          @changed-environment="changedEnvironment"
        />
      </UiTitledCard>
      <UiTitledCard title="Data details">
        <PageConnectionsServicesDataSettings
          ref="dataSettings"
          v-model="form.fromOptions"
          :errors="errors"
          hide-save-button
          direction="source"
          :selected-factory-system="sourceFactorySystem"
          :selected-service-template="serviceTemplate"
        />
      </UiTitledCard>
      <div class="flex flex-1 justify-end space-x-2 py-5">
        <div>
          <button type="button" class="button button-secondary">Cancel</button>
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
</template>

<script>
const EventBus = useLegacyEventBus();

export default {
  name: 'ServiceSource',
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
        fromEnvironment: this.$attrs.connector.environment,
        fromOptions: {
          systemId: this.service.source_system_id,
          page_size: 100,
          max_attempts: 4,
          timezone:
            this.service.from_options?.timezone ??
            this.service.source_connector?.timezone,
          ...this.service.from_options,
        },
      },
      errors: {},
      sourceSystem: this.service.source_system,
      submitting: false,
    };
  },
  computed: {
    payload() {
      return {
        from_options: this.form.fromOptions,
        from_environment: this.form.fromEnvironment,
      };
    },
    serviceTemplate() {
      return this.service?.service_template;
    },
    sourceFactorySystem() {
      return this.service?.source_factory_system;
    },
  },
  methods: {
    changedEnvironment(environment) {
      this.form.fromEnvironment = environment;
    },
    optionsUpdated(updatedOptions) {
      this.form.fromOptions = updatedOptions;
      const timezone =
        this.form.fromOptions.timezone ??
        this.service.source_connector?.timezone;
      if (timezone !== null) {
        this.form.fromOptions.timezone = timezone;
      }
    },
    reload(service) {
      if (this.payload.from_environment !== this.$attrs.connector.environment) {
        navigateTo({
          name: 'connections-connectionId-services-serviceId-source',
          params: {
            connectionId: service.data.source_connector.id,
            serviceId: service.data.id,
          },
        });
      }
    },
    async handleSubmit() {
      if (this.$refs.dataSettings.editorToDisplay === 'options') {
        this.$refs.dataSettings.updateOptions();
      }

      this.submitting = true;
      try {
        if (this.$patchworksAdmin()) {
          const service = await this.$axios.$patch(
            `/api/api/v2/admin/services/${this.service.id}`,
            this.payload
          );
          EventBus.emit('service:updated', this.service.id);
          this.reload(service);
        } else {
          const service = await this.$axios.$patch(
            `/api/api/v2/services/${this.service.id}`,
            this.payload
          );
          EventBus.emit('service:updated', this.service.id);
          this.reload(service);
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
