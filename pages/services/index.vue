<template>
  <div>
    <PageHeader>
      <template #title>Services</template>

      <template #description>
        <p>Your services sync data between each of your connected systems.</p>
      </template>
      <template #actions>
        <UiCard class="w-60">
          <div class="flex items-center gap-2 text-xs">
            <div class="flex">
              <span class="icon icon--stack text-lg" />
            </div>
            <div>
              <p class="text-sm">
                {{ primarySubscription?.name }}
              </p>
            </div>
          </div>
          <div class="mt-4 mb-4">
            <ProgressBar
              label="Active Services"
              :total="allowance.services"
              :progress="usage.active_services"
            />
          </div>

          <button
            v-if="$can('create services')"
            class="button button-primary w-full"
            @click="checkForBaseSubscription('/connections/new-service')"
          >
            Add new service
          </button>
        </UiCard>
      </template>
    </PageHeader>
    <div>
      <div v-if="$fetchState.pending" class="flex items-center gap-3">
        <uiLoading class="relative h-full w-full" />
      </div>

      <template v-else>
        <uiCard wide>
          <label class="mx-4 mt-4 mb-1.5 md:hidden">Company group</label>
          <UiCollapsibleTabs
            :modelValue="filters.integration_username"
            :disabled="$fetchState.pending || loading"
            :tabs="integrationTabs"
            :hide-on-mobile="false"
            class="mx-4 md:mx-0"
            placeholder="Select a company group"
            label="Select a company group"
            @update:modelValue="integrationSelected"
          />

          <div v-if="loading" class="flex items-center gap-3 bg-white py-10">
            <uiLoading class="relative h-full w-full" />
          </div>

          <div v-else>
            <div class="flex items-center space-x-3 px-4 py-3">
              <div class="flex-1">
                <input
                  v-model="filters.search"
                  class="input-text h-10 w-full"
                  type="text"
                  placeholder="search"
                />
              </div>
              <div>
                <button
                  class="button button-secondary h-10"
                  @click="slideOverOpen = true"
                >
                  Filters
                </button>
              </div>
            </div>
            <TableServices
              :entries="filteredServices"
              :loading="loading"
              :services="services"
              @service-updated="handleServiceUpdated"
              @service-cloned="handleCloneService"
            />
          </div>

        </uiCard>
      </template>
    </div>

    <Modal
      id="connectorSubscriptionWarning"
      classes="modal--small"
      :close-on-backdrop-click="false"
    >
      <ConnectionsSubscriptionWarning prevented-from-adding="service" />
    </Modal>

    <PageServicesFiltersSlideOver
      :open="slideOverOpen"
      :services="services"
      @close="slideOverOpen = false"
      @filtered="($event) => (sidebarFilters = $event)"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia';
import collect from 'collect.js';
import { subscriptionHelperMixin } from '@/mixins/subscription-helper-mixin';

export default {
  name: 'Services',
  mixins: [subscriptionHelperMixin],
  data() {
    return {
      slideOverOpen: false,
      integrations: [],
      services: [],
      loading: true,
      sidebarFilters: {
        status: 'all',
        sourceSystemId: 'all',
        sourceEntityId: 'all',
      },
      filters: {
        search: '',
        integration_username: undefined,
      },
    };
  },
  async fetch() {
    [this.integrations] = await Promise.all([
      this.$axios
        .$get('/api/api/v2/integrations', {
          params: {
            per_page: 50,
          },
        })
        .then((r) => r.data),
      this.loadSystems(),
    ]);
    this.filters.integration_username = this.integrations[0]?.username;

    this.loadServices();
  },
  computed: {
    ...mapState(useSystemStore, ['systems']),
    ...mapState(useSubscriptionStore, [
      'primarySubscription',
      'allowance',
      'usage',
    ]),
    integrationTabs() {
      return this.integrations
        ? this.integrations.map((integration) => ({
            label: integration.name,
            key: integration.username,
            id: integration.id,
          }))
        : [];
    },
    filteredServices() {
      return (
        collect(this.services)
          // Search input
          .when(this.filters.search !== '', (items) =>
            items.filter((item) =>
              [
                item.id.toString(),
                item.type.toLowerCase(),
                item.description.toLowerCase(),
              ].some((attribute) =>
                attribute.includes(this.filters.search.toLowerCase())
              )
            )
          )
          // Sidebar filters
          .when(this.sidebarFilters.status !== 'all', (items) =>
            items.filter((item) => item.status === this.sidebarFilters.status)
          )
          .when(this.sidebarFilters.sourceSystemId !== 'all', (items) =>
            items.filter(
              (item) =>
                item.source_system?.id === this.sidebarFilters.sourceSystemId
            )
          )
          .when(this.sidebarFilters.sourceEntityId !== 'all', (items) =>
            items.filter(
              (item) =>
                item.source_entity?.id === this.sidebarFilters.sourceEntityId
            )
          )
          .all()
      );
    },
    entries() {
      return collect(this.filteredServices).groupBy('source_system_id').all();
    },
  },
  watch: {
    'filters.integration_username': {
      handler() {
        if (!this.$fetchState.pending) {
          this.loadServices();
        }
      },
    },
  },
  methods: {
    ...mapActions(useSystemStore, ['loadSystems']),
    async loadServices() {
      this.loading = true;

      this.services = await this.$axios
        .$get('/api/api/v2/services', {
          params: {
            'fields[service]': [
              'id',
              'status',
              'type',
              'description',
              'from_factory',
              'from_environment',
              'to_factory',
              'to_environment',
              'username',
              'schedule',
              'from_options',
              'to_options',
              'service_template_id',
              'from_mapping',
              'to_mapping',
            ].join(','),
            perPage: 300,
            'filter[username]': this.filters.integration_username,
            include: [
              'settings',
              'integration',
              'serviceTemplate.source',
              'serviceTemplate.destination',
            ].join(','),
          },
        })
        .then((r) => r.data);

      /**
       * Temporary: for debugging purposes START
       */
      const servicesWithoutSourceSystems = this.services.filter(
        (service) => !service.source_system
      );

      if (servicesWithoutSourceSystems.length > 0) {
        console.log(
          'Services missing source system',
          servicesWithoutSourceSystems
        ); // eslint-disable-line no-console
      }
      /**
       * Temporary: for debugging purposes END
       */

      this.loading = false;
    },
    integrationSelected(username) {
      this.filters.integration_username = username;
    },
    handleServiceUpdated(updated) {
      this.services = this.services.map((service) =>
        service.id === updated.id ? updated : service
      );
    },
    handleCloneService() {
      this.loadServices();
    },
  },
};
</script>
