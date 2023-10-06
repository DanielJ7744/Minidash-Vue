<template>
  <div class="relative h-full">
    <Teleport to="#child-navigation-portal">
      <UiChildPageNavigation :tabs="tabs" />
    </Teleport>

    <div v-if="$fetchState.pending || !service" class="relative h-full w-full">
      <UiLoading />
    </div>

    <NuxtPage v-else :service="service" v-bind="$attrs" />
  </div>
</template>

<script>
import { mapState } from 'pinia';
import Systems from '@/enums/Systems';
import plans from '@/enums/Plans';

const EventBus = useLegacyEventBus();

export default {
  name: 'ServiceId',
  setup() {
    return {
      route: useRoute(),
    };
  },
  data: () => ({
    service: null,
  }),
  async fetch() {
    await this.fetchService();
  },
  computed: {
    ...mapState(useSubscriptionStore, ['plans']),
    integrationIsOnK8s() {
      return this.service?.integration?.server.endsWith('-k8s');
    },
    tabParams() {
      return {
        serviceId: this.route.params.serviceId,
        connectionId: this.route.params.connectionId,
      };
    },
    disableManualRunService() {
      return !this.service?.status || this.service?.type === 'Event';
    },
    tabs() {
      const params = this.tabParams;
      const tabs = [
        {
          title: 'Summary',
          link: {
            name: 'connections-connectionId-services-serviceId',
            params,
          },
        },
      ];

      if (!this.service?.source_system) {
        return tabs;
      }

      if (this.$can('update services')) {
        tabs.push({
          title: 'Canvas',
          link: {
            name: 'connections-connectionId-services-serviceId-canvas',
            params,
          },
        });
        tabs.push(...this.getTabsForSystem(params));
        tabs.push({
          title: 'Destination',
          link: {
            name: 'connections-connectionId-services-serviceId-destination',
            params,
          },
        });
        tabs.push({
          title: 'Mapping',
          link: {
            name: 'connections-connectionId-services-serviceId-mapping',
            params,
          },
        });
        if (
          this.integrationIsOnK8s &&
          this.plans?.some((plan) =>
            [plans.PROFESSIONAL, plans.ENTERPRISE].includes(plan.name)
          )
        ) {
          tabs.push({
            title: 'Payload Script',
            link: {
              name: 'connections-connectionId-services-serviceId-payload-script',
              params,
            },
          });
        }
        tabs.push({
          title: 'Alerts',
          link: {
            name: 'connections-connectionId-services-serviceId-alerts',
            params,
          },
        });
        tabs.push({
          title: 'Run Service',
          link: {
            name: 'connections-connectionId-services-serviceId-run',
            params,
          },
          disabled: this.disableManualRunService,
          reason: !this.service?.status
            ? 'This service is disabled.'
            : 'Webhook services cannot be run manually.',
          class: this.disableManualRunService
            ? 'pointer-events-none text-gray-400'
            : '',
        });
        tabs.push({
          title: 'Settings',
          link: {
            name: 'connections-connectionId-services-serviceId-settings',
            params,
          },
        });
      }

      return tabs;
    },
  },
  watch: {
    'route.params.serviceId': '$fetch',
  },
  mounted() {
    EventBus.on('service:updated', async (serviceId) => {
      if (serviceId === parseInt(this.route.params.serviceId)) {
        await this.fetchService();
        EventBus.emit('service.list:update', this.service);
      }
    });
  },
  methods: {
    async fetchService() {
      this.service = await this.$axios
        .$get(`/api/api/v2/services/${this.route.params.serviceId}`, {
          params: {
            include: [
              'settings',
              'integration',
              'serviceTemplate',
              'serviceTemplate.source',
              'serviceTemplate.source.serviceFactory',
              'serviceTemplate.destination',
              'serviceTemplate.source.system.webhookFactory',
              'serviceTemplate.source.factorySystemServiceOptions.serviceOption',
              'serviceTemplate.destination.factorySystemServiceOptions.serviceOption',
              'serviceTemplate.serviceTemplateOptions',
            ].join(','),
          },
        })
        .then((r) => r.data);
    },
    getTabsForSystem(params) {
      switch (this.service.source_system.name) {
        case Systems.INBOUND_API:
          return [
            {
              title: 'Endpoint',
              link: {
                name: 'connections-connectionId-services-serviceId-endpoint',
                params,
              },
            },
          ];
        case Systems.SFTP:
          return [
            {
              title: 'Trigger',
              link: {
                name: 'connections-connectionId-services-serviceId-trigger',
                params,
              },
            },
          ];
        default:
          return [
            {
              title: 'Filters',
              link: {
                name: 'connections-connectionId-services-serviceId-filters',
                params,
              },
            },
            {
              title: 'Trigger',
              link: {
                name: 'connections-connectionId-services-serviceId-trigger',
                params,
              },
            },
            {
              title: 'Source',
              link: {
                name: 'connections-connectionId-services-serviceId-source',
                params,
              },
            },
          ];
      }
    },
  },
};
</script>
