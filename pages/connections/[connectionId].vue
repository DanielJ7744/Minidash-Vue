<template>
  <div class="h-full">
    <Modal
      id="connectorSubscriptionWarning"
      classes="modal--small"
      :close-on-backdrop-click="false"
    >
      <ConnectionsSubscriptionWarning prevented-from-adding="service" />
    </Modal>

    <UiLoading v-if="$fetchState.pending" />

    <template v-else>
      <Teleport to="#child-navigation-portal">
        <UiChildPageNavigation :tabs="tabs" />
      </Teleport>

      <NuxtPage
        :system="system"
        :connector="credential"
        :integration="integration"
        :entities="entities"
      />

      <!-- Sidebar -->
      <Teleport to="#side-bar-portal">
        <div
          class="relative hidden h-full border-gray-200 bg-gray-50 md:flex md:w-72 md:flex-col md:border-r"
        >
          <div>
            <div class="relative z-10 h-16 border-b bg-white hover:bg-gray-100">
              <UiLoading v-if="$fetchState.pending" />
              <div v-else class="flex h-full items-center space-x-2 px-4">
                <SystemIcon
                  class="aspect-square w-10 rounded"
                  :system-name="system.name"
                />
                <div>
                  <p
                    v-if="
                      credential.credentials &&
                      credential.credentials.connector_name
                    "
                    class="m-0 text-sm font-medium text-gray-700"
                  >
                    {{ credential.credentials.connector_name }}
                  </p>
                  <p v-else class="m-0 font-medium text-gray-700">
                    {{ integration.name }}
                  </p>
                  <p
                    class="m-0 text-xs text-gray-500"
                    v-if="
                      credential.credentials && credential.credentials.store
                    "
                  >
                    {{ credential.credentials.store }}
                  </p>
                </div>
              </div>
              <!-- Extend touch target to entire panel -->
              <NuxtLink
                v-slot="{ isExactActive, navigate }"
                custom
                :to="{
                  name: 'connections-connectionId',
                  params: { connectionId: route.params.connectionId },
                }"
              >
                <a
                  aria-hidden="true"
                  class="absolute inset-0 focus:outline-none"
                  :class="{
                    'border-primary border-l-4 duration-150': isExactActive,
                  }"
                  @click="navigate"
                />
              </NuxtLink>
            </div>
          </div>

          <UiLoading v-if="$fetchState.pending" />

          <ServicesList
            v-else
            class="mb-16 h-full overflow-y-auto"
            :loading="$fetchState.pending"
            :entities="entities"
            :services="services"
            :system="system"
            :integration="integration"
            :credential="credential"
          />

          <NuxtLink
            v-if="$can('create services') && canAddServicesForSystem"
            v-slot="{ isActive }"
            :to="{
              name: 'connections-connectionId-services-create',
              params: { connectionId: route.params.connectionId },
            }"
            custom
          >
            <button
              class="absolute bottom-0 z-10 h-16 w-full border-t bg-white hover:bg-gray-100"
              @click.prevent="
                checkForBaseSubscription({
                  name: 'connections-connectionId-services-create',
                  params: { connectionId: route.params.connectionId },
                })
              "
            >
              <div
                class="flex h-full items-center space-x-3 px-4 text-gray-600"
              >
                <div class="icon icon--add text-lg" />
                <p class="text-sm font-medium">Add new service</p>
              </div>
              <a
                aria-hidden="true"
                class="absolute inset-0 focus:outline-none"
                :class="{
                  'border-primary border-l-4 duration-150': isActive,
                }"
              />
            </button>
          </NuxtLink>
        </div>
      </Teleport>

      <Teleport to="#slide-over-portal">
        <UiSlideOver :open="slideOver" @close="slideOver = false">
          <div
            class="flex items-center space-x-2 border-r border-gray-200 px-4 py-3"
          >
            <template v-if="!$fetchState.pending">
              <SystemIcon
                class="aspect-square w-12"
                :system-name="system.name"
              />
              <p class="m-0 font-medium text-gray-700">
                {{ integration.name }}
              </p>
            </template>
          </div>

          <ServicesList
            class="h-full overflow-y-auto"
            :loading="$fetchState.pending"
            :entities="entities"
            :services="services"
            :system="system"
            :integration="integration"
            :credential="credential"
          />

          <NuxtLink
            v-if="$can('create services') && canAddServicesForSystem"
            v-slot="{ isActive }"
            custom
            :to="{
              name: 'connections-connectionId-services-create',
              params: { connectionId: route.params.connectionId },
            }"
          >
            <button
              @click.prevent="
                checkForBaseSubscription({
                  name: 'connections-connectionId-services-create',
                  params: { connectionId: route.params.connectionId },
                })
              "
              class="absolute bottom-0 z-10 h-16 w-full border-t bg-white hover:bg-gray-100"
            >
              <div
                class="flex h-full items-center space-x-3 px-4 text-gray-600"
              >
                <div class="icon icon--add text-lg" />
                <p class="text-sm font-medium">Add new service</p>
              </div>
              <a
                aria-hidden="true"
                class="absolute inset-0 focus:outline-none"
                :class="{
                  'border-primary border-l-4 duration-150': isActive,
                }"
              />
            </button>
          </NuxtLink>
        </UiSlideOver>
      </Teleport>
    </template>
  </div>
</template>

<script>
import Systems from '@/enums/Systems';
import { mapActions } from 'pinia';
import { systemsHelperMixin } from '@/mixins/system-helper-mixin';
import { subscriptionHelperMixin } from '@/mixins/subscription-helper-mixin';

const EventBus = useLegacyEventBus();

export default {
  name: 'ConnectorId',
  mixins: [systemsHelperMixin, subscriptionHelperMixin],
  setup() {
    return {
      route: useRoute(),
    };
  },
  data: () => ({
    slideOver: false,
    entities: [],
    services: [],
    system: null,
    credential: null,
    integration: null,
  }),
  async fetch() {
    this.credential = await this.loadCredentialsByCredentialId(
      this.route.params.connectionId
    ).then((r) => r.data);

    if (!Object.keys(this.credential).length) {
      this.$notify({
        group: 'notifications',
        type: 'error',
        text: 'Failed loading credential. Please check entered data.',
      });

      return navigateTo({ name: 'connections' });
    }

    this.entities = await this.$axios
      .$get('/api/api/v2/entities')
      .then((r) => r.data);

    this.system = this.credential.system;
    this.integration = this.credential.integration;

    await this.fetchServices();

    if (!this.$patchworksAdmin()) {
      this.services = this.services.filter((service) => !!service.billable);
    }
  },
  computed: {
    tabs() {
      const params = {
        connectionId: this.route.params.connectionId,
      };

      let tabs = [
        {
          title: 'Summary',
          link: { name: 'connections-connectionId', params },
        },
        {
          title: 'Services',
          action: () => EventBus.emit('slide-over:service-list'),
          class: 'md:hidden',
        },
      ];

      if (this.$can('update services')) {
        tabs.push({
          title: 'Settings',
          link: { name: 'connections-connectionId-settings', params },
        });
      }

      if (this.system.name === Systems.INBOUND_API) {
        tabs.push({
          title: 'Authentication',
          link: {
            name: 'connections-connectionId-authentication',
            params,
          },
        });
      }

      if (this.system.name === Systems.BI) {
        tabs = [
          {
            title: 'Settings',
            link: { name: 'connections-connectionId-settings', params },
          },
        ];
      }

      return tabs;
    },
    canAddServicesForSystem() {
      return !['globalev2'].includes(this.system?.factory_name.toLowerCase());
    },
  },
  mounted() {
    EventBus.on('slide-over:service-list', () => {
      this.slideOver = true;
    });
    EventBus.on('connector:updated', (updated) => {
      if (updated.id === this.credential.id) {
        this.credential = updated;
      }
    });

    EventBus.on('service.list:added', (added) => {
      this.services.push(added);
    });

    EventBus.on('service.list:update', (updatedService) => {
      const serviceIndex = this.services.findIndex(
        (service) => service.id === updatedService.id
      );

      this.services[serviceIndex] = updatedService;
    });

    EventBus.on('service.list:removed', (removed) => {
      this.services = this.services.filter(
        (service) => service.id !== removed.id
      );
    });
  },
  beforeUnmount() {
    EventBus.off('slide-over:service-list');
    EventBus.off('connector:updated');
    EventBus.off('service.list:added');
    EventBus.off('service.list:update');
    EventBus.off('service.list:removed');
  },
  methods: {
    ...mapActions(useSystemStore, ['loadCredentialsByCredentialId']),
    async fetchServices() {
      const services = await this.$axios
        .$get(
          `/api/api/v2/integrations/${this.credential.integration.id}/services`
        )
        .then((r) => r.data);

      this.services = services
        .filter((service) => service.username === this.integration.username)
        .filter(
          (service) => service.source_system_id === this.credential.system.id
        )
        .filter(
          (service) => service.from_environment === this.credential.environment
        );
    },
  },
};
</script>
