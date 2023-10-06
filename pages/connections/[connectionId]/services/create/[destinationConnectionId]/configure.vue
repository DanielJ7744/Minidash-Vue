<template>
  <div class="page-container space-y-5 divide-y">
    <PageHeader>
      <template #title>Configure service settings</template>

      <template #actions>
        <SystemChainIcons
          :loading="$fetchState.pending"
          :source="sourceSystem"
          :destination="destinationSystem"
        />
      </template>
    </PageHeader>

    <div v-if="!$fetchState.pending">
      <form class="divide-y" @submit.prevent="handleSubmit">
        <ServicesSettingsEntitySelector
          :source-system="sourceSystem"
          :destination-system="destinationSystem"
          :integration="integration"
          @templateCreated="templateCreated"
          @pullFactorySystem="pullFactorySystem"
          @pushFactorySystem="pushFactorySystem"
        />
        <template v-if="form.serviceTemplate">
          <ServicesSettingsServiceSettings
            v-model="form.details"
            :errors="errors"
            :selected-service-template="selectedServiceTemplate"
            :source-system="sourceSystem"
          />
          <UiTitledCard title="Source Details">
            <PageConnectionsServicesServiceSystemSettingsForm
              v-if="form.serviceTemplate"
              v-model="form.sourceSettings"
              read-only
              hide-entity
              direction="source"
              :errors="errors"
              :systems="systems"
              :environment="connector.environment"
              :selected-service-template="
                serviceTemplates.find(
                  (serviceTemplate) =>
                    parseInt(serviceTemplate.id) ===
                    parseInt(form.serviceTemplate)
                )
              "
              :selected-factory-system="sourceFactorySystem"
              :connector="connector"
              :configurable="true"
              @value-entered="updateServiceOptions($event)"
            />
            <PageConnectionsServicesDataSettings
              v-model="form.sourceSettings"
              :errors="errors"
              hide-save-button
              direction="source"
              :selected-factory-system="sourceFactorySystem"
              :selected-service-template="form.serviceTemplate"
            />
          </UiTitledCard>
          <UiTitledCard title="Destination Details">
            <PageConnectionsServicesServiceSystemSettingsForm
              v-if="form.serviceTemplate"
              v-model="form.destinationSettings"
              read-only
              hide-entity
              direction="destination"
              :errors="errors"
              :systems="systems"
              :environment="destinationConnector.environment"
              :selected-service-template="
                serviceTemplates.find(
                  (serviceTemplate) =>
                    parseInt(serviceTemplate.id) ===
                    parseInt(form.serviceTemplate)
                )
              "
              :selected-factory-system="destinationFactorySystem"
              :connector="destinationConnector"
              :configurable="true"
              @value-entered="updateServiceOptions($event)"
            />
            <PageConnectionsServicesDataSettings
              v-model="form.destinationSettings"
              :errors="errors"
              hide-save-button
              direction="destination"
              :selected-factory-system="destinationFactorySystem"
              :selected-service-template="form.serviceTemplate"
            />
          </UiTitledCard>
        </template>
        <div class="flex flex-1 justify-end space-x-2 py-5">
          <button
            type="button"
            class="button button-secondary"
            @click="$router.go(-1)"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="button button-primary"
            :disabled="submitting || !canCreateService"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
const EventBus = useLegacyEventBus();

export default {
  name: 'ConfigureService',
  props: {
    integration: {
      type: Object,
      required: true,
    },
    connector: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      errors: {},
      submitting: false,
      systems: [],
      serviceTemplates: [],
      form: {
        serviceTemplate: null,
        sourceSettings: {
          systemId: this.connector.system.id,
          page_size: 100,
          max_attempts: 4,
          timezone: dayjs.tz.guess(),
        },
        destinationSettings: {
          systemId: null,
          timezone: dayjs.tz.guess(),
        },
        active: false,
        details: {
          id: null,
          description: null,
          callsPerSecond: 1,
          schedule: 'off',
          type: null,
        },
        alertStatus: null,
        alertSchedule: null,
      },
      additionalFromOptions: {},
      additionalToOptions: {},
      serviceTemplateIncludeString:
        'include=serviceTemplateOptions,source.serviceFactory,source.system,source.entity,destination.serviceFactory,destination.system,destination.entity',
      canCreateService: false,
      sourceSystem: null,
      destinationSystem: null,
      sourceFactorySystem: null,
      destinationFactorySystem: null,
      useAdvancedSelector: false,
      destinationConnector: null,
    };
  },
  setup() {
    return {
      route: useRoute(),
    };
  },
  async fetch() {
    this.systems = await this.$axios
      .$get('/api/api/v2/systems?include=webhookFactory')
      .then((r) => r.data);
    this.destinationConnector = await this.$axios
      .$get(`/api/api/v2/connectors/${this.destinationConnectionId}`)
      .then((r) => r.data);
    this.form.destinationSettings.systemId =
      this.destinationConnector.system.id;
    this.sourceSystem = this.systems.find(
      (system) => system.id === parseInt(this.form.sourceSettings.systemId)
    );
    this.destinationSystem = this.systems.find(
      (system) => system.id === parseInt(this.form.destinationSettings.systemId)
    );
    this.serviceTemplates = await this.$axios
      .$get(
        `/api/api/v2/service-templates?${this.serviceTemplateFilterString}&${this.serviceTemplateIncludeString}`
      )
      .then((r) => r.data);
  },
  computed: {
    serviceTemplateFilterString() {
      return `filter[source.system_id]=${this.connector.system.id}&filter[destination.system_id]=${this.destinationConnector.system.id}&filter[integration_id]=${this.integration.id}`;
    },
    origin() {
      return `${this.integration.username}-${this.connector.system.name}-${this.connector.environment}`;
    },
    destinationConnectionId() {
      return this.route.params.destinationConnectionId;
    },
    selectedServiceTemplate() {
      return this.serviceTemplateById(this.form?.serviceTemplate?.id);
    },
    payload() {
      const payload = {
        description: this.form.details.description,
        type: this.form.details.type,
        schedule: 'off',
        from_environment: this.connector.environment,
        to_environment: this.destinationConnector.environment,
        from_options: this.form.sourceSettings,
        to_options: this.form.destinationSettings,
      };

      if (this.form.serviceTemplate) {
        payload.service_template_id = this.form.serviceTemplate.id;
      }

      if (this.destinationSystem.factory_name === 'Netsuite') {
        // add a default origin to NetSuite services
        payload.to_options = {
          origin: this.origin,
        };
      }

      return payload;
    },
  },
  methods: {
    defaultServiceType() {
      return this.serviceTemplateById(this.form.serviceTemplate.id)
        ?.source_factory_system?.service_factory?.name ===
        this.webhookFactoryName() && this.webhookFactoryName() !== undefined
        ? 'Event'
        : 'Standard';
    },
    serviceTemplateById(serviceTemplateId) {
      if (!serviceTemplateId) {
        return null;
      }

      return this.serviceTemplates.find(
        (serviceTemplate) =>
          parseInt(serviceTemplate.id) === parseInt(serviceTemplateId)
      );
    },
    webhookFactoryName() {
      return this?.sourceSystem?.webhook_factory?.name;
    },
    pullFactorySystem(value) {
      this.sourceFactorySystem = value;
    },
    pushFactorySystem(value) {
      this.destinationFactorySystem = value;
    },
    templateCreated(serviceTemplate) {
      this.form.serviceTemplate = serviceTemplate;
      this.form.details.type = this.defaultServiceType();
      const sourceSystem = this.sourceSystem.name;
      const destinationSystem = this.destinationSystem.name;
      this.form.details.description = `${serviceTemplate.name} - ${sourceSystem} - ${destinationSystem}`;
      this.canCreateService = true;
    },
    async handleSubmit() {
      this.submitting = true;

      try {
        const response = await this.$axios.$post(
          `/api/api/v2/integrations/${this.integration.id}/services`,
          this.payload
        );

        EventBus.emit('service.list:added', response.data);

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Service created successfully',
          },
          4000
        );

        navigateTo({
          name: 'connections-connectionId-services-serviceId-canvas',
          query: {
            path: 'new',
          },
          params: {
            connectionId: this.route.params.connectionId,
            serviceId: response.data.id,
          },
        });
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
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: 'An error occurred while creating the service.',
            },
            4000
          );
        }
      }

      this.submitting = false;
    },
    updateServiceOptions(event) {
      if (event.direction === 'destination') {
        this.additionalToOptions[event.key] = event.value;
      } else {
        this.additionalFromOptions[event.key] = event.value;
      }
    },
  },
};
</script>
