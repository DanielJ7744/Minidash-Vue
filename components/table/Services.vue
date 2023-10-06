<template>
  <template v-if="entries.length">
    <DataTable
      :value="entries"
      dataKey="id"
      responsiveLayout="scroll"
      rowGroupMode="subheader"
      groupRowsBy="source_system_id"
      sortMode="single"
      sortField="source_system_id"
      :sortOrder="1"
      tableStyle="min-width: 850px"
    >
      <template #groupheader="{ data: service }">
        <div class="flex w-full items-center space-x-3">
          <SystemIcon
            class="w-9"
            :system-name="
              (systemsById[service.source_system_id] &&
                systemsById[service.source_system_id].name) ||
              'Other'
            "
          />
          <p class="h6">
            {{
              (systemsById[service.source_system_id] &&
                systemsById[service.source_system_id].name) ||
              'Other'
            }}
          </p>
        </div>
      </template>
      <Column field="source_system_id" header="Service"></Column>
      <Column field="id" header="ID" class="w-1/12" :sortable="true">
        <template #body="{ data: service }">
          <div @click="navigateToService(service)">
            {{ service.id }}
          </div>
        </template>
      </Column>
      <Column field="status" header="Status" class="w-1/12" :sortable="true">
        <template #body="{ data: service }">
          <div @click="navigateToService(service)">
            <ServicesStatusIcon :status="service.status" />
          </div>
        </template>
      </Column>
      <Column field="type" header="Type" class="w-1/12" :sortable="true">
        <template #body="{ data: service }">
          <div @click="navigateToService(service)">
            {{ service.type }}
          </div>
        </template>
      </Column>
      <Column
        field="description"
        header="Service"
        class="w-auto"
        :sortable="true"
      >
        <template #body="{ data: service }">
          <div class="whitespace-normal" @click="navigateToService(service)">
            {{ service.description }}
          </div>
        </template>
      </Column>
      <Column field="source_system" header="Flow" class="w-[160px]">
        <template #body="{ data: service }">
          <div class="flex items-center space-x-1">
            <SystemIcon
              class="w-10"
              :system-name="
                service.source_system && service.source_system.name
                  ? service.source_system.name
                  : 'patchworks'
              "
            />
            <div>
              <span class="icon icon--arrow-right text-gray-500" />
            </div>
            <div>
              <span
                class="icon text-gray-500"
                :class="entityIconClass(service)"
              />
            </div>
            <div>
              <span class="icon icon--arrow-right text-gray-500" />
            </div>
            <SystemIcon
              class="w-10"
              :system-name="
                service.destination_system && service.destination_system.name
                  ? service.destination_system.name
                  : 'patchworks'
              "
            />
          </div>
        </template>
      </Column>
      <Column
        field="schedule"
        header="Schedule"
        class="w-1/12"
        :sortable="true"
      >
        <template #body="{ data: service }">
          <div @click="navigateToService(service)">
            <p class="inline whitespace-normal">
              {{ humanCron(service.schedule, 'Off') }}
            </p>
          </div>
        </template>
      </Column>
      <Column field="status" class="w-1/12">
        <template #body="{ data: service }">
          <div class="flex items-center justify-end">
            <!-- Notifications -->
            <button
              v-tooltip.top="
                serviceNotificationsEnabled(service)
                  ? 'Alerts are on'
                  : 'Alerts are off'
              "
              class="button-icon"
              @click="openNotifications(service)"
            >
              <Icon
                size="1.5em"
                :name="
                  serviceNotificationsEnabled(service)
                    ? 'la:bell'
                    : 'la:bell-slash'
                "
              />
            </button>

            <UiDropdownMenu
              :links="[
                {
                  title: 'More Details',
                  action: () => viewSourceAndDestinationDetails(service),
                  if: $patchworks(),
                },
                {
                  title: 'View Logs',
                  action: () => viewLogs(service),
                },
                {
                  title: 'Run Service...',
                  action: () => navigateToService(service, 'run'),
                  if:
                    service.status === true &&
                    $can('manually trigger services'),
                },
                {
                  title: 'Enable Service',
                  action: () => updateServiceStatus(service, 'Enable'),
                  if: service.status === false && $can('update services'),
                },
                {
                  title: 'Disable Service',
                  action: () => updateServiceStatus(service, 'Disable'),
                  if: service.status && $can('update services'),
                },
                {
                  title: 'Clone Service',
                  action: () => cloneService(service),
                  if: $can('create services'),
                },
              ]"
            />
          </div>
        </template>
      </Column>
      <template #empty
        >No matching services, try different filters or search or add a new
        service</template
      >
    </DataTable>
    <Modal
      id="viewSourceAndDestinationDetails"
      title="Service Details"
      size="lg"
    >
      <ServicesServiceDetails
        v-if="selectedService"
        :service="selectedService"
      />
    </Modal>

    <Modal
      id="cloneService"
      title="Clone Service"
      classes="modal--small"
      :close-on-backdrop-click="false"
    >
      <ServicesCloneService
        :service-to-clone="serviceToClone"
        @serviceCloned="serviceCloned"
      />
    </Modal>
  </template>
</template>

<script>
import { mapActions, mapState } from 'pinia';
import collect from 'collect.js';
import { entitiesHelperMixin } from '@/mixins/entities-helper-mixin';

export default {
  name: 'ServiceTable',
  mixins: [entitiesHelperMixin],
  props: {
    entries: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      selectedService: null,
      serviceRunIds: [],
      serviceToClone: null,
    };
  },
  computed: {
    ...mapState(useSystemStore, {
      systems: 'systems',
    }),
    systemsById() {
      return collect(this.systems).keyBy('id').all();
    },
  },
  methods: {
    ...mapActions(useUiStore, ['openModal', 'closeModal']),
    navigateToService(service, endpoint = null) {
      if (!service.source_connector?.id) {
        return;
      }

      if (endpoint) {
        return navigateTo({
          name: `connections-connectionId-services-serviceId-${endpoint}`,
          params: {
            connectionId: service.source_connector.id,
            serviceId: service.id,
          },
        });
      }

      return navigateTo({
        name: 'connections-connectionId-services-serviceId',
        params: {
          connectionId: service.source_connector.id,
          serviceId: service.id,
        },
      });
    },
    entityIconClass(service) {
      return this.getEntityIconClass(service.source_entity?.name);
    },
    viewSourceAndDestinationDetails(service) {
      this.selectedService = service;
      this.openModal('viewSourceAndDestinationDetails');
    },
    viewLogs(service) {
      this.selectedService = service;
      this.navigateToService(service);
    },
    async updateServiceStatus(service, status) {
      const confirmed = confirm(
        `Are you sure you want to ${status} this Service?`
      );

      if (confirmed) {
        try {
          const response = await this.$axios.$patch(
            `/api/api/v2/services/${service.id}`,
            { status: !service.status }
          );

          this.$notify(
            {
              group: 'notifications',
              type: 'success',
              text: 'Service status updated',
            },
            4000
          );

          this.$emit('service-updated', response.data);
        } catch (e) {
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: 'Failed to update service status',
            },
            4000
          );
        }
      }
    },
    serviceNotificationsEnabled(service) {
      return service.settings?.include_in_daily_failure_summary || false;
    },
    openNotifications(service) {
      if (service.source_connector?.id) {
        navigateTo({
          name: 'connections-connectionId-services-serviceId-alerts',
          params: {
            serviceId: service.id,
            connectionId: service.source_connector.id,
          },
        });
      }
    },
    cloneService(serviceToClone) {
      this.serviceToClone = serviceToClone;
      this.openModal('cloneService');
    },
    serviceCloned() {
      this.$emit('service-cloned');
    },
  },
};
</script>

<style lang="postcss" scoped>
.services-table {
  @apply relative min-w-full space-y-10 md:rounded-lg;

  table {
    @apply min-w-full table-fixed border-b;

    caption {
      @apply border-t bg-gray-100 py-3 px-4 text-left text-lg font-medium text-gray-800;
    }

    thead {
      @apply hidden border-t bg-gray-50 lg:table-header-group;

      tr {
        @apply border-b border-gray-200 bg-gray-50;

        th {
          @apply px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6;
        }
      }
    }

    tbody {
      @apply bg-white transition-all duration-150 ease-in-out;

      tr {
        @apply border-t border-gray-200;

        td {
          @apply text-sm font-medium text-gray-600 lg:py-2 lg:px-3 lg:pl-6;
        }
      }
    }
  }
}
</style>
