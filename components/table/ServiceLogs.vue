<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <div v-else>
    <Modal id="relatedRecords" title="Related Records" size="lg">
      <ServicesServiceLogRelatedRecords :service-log="selectedServiceLog" />
    </Modal>

    <Modal
      id="stopServiceConfirmation"
      :close-on-backdrop-click="false"
      classes="modal--small"
      title="Are you sure you want to stop this service?"
    >
      <PageConnectionsServicesRunStopServiceConfirmationModal
        stop-run-text="Stop this Run"
        @stopService="cancelService(false)"
        @stopLatestRun="cancelService(true)"
      />
    </Modal>
    <DataTable
      :value="filteredLogs"
      :paginator="true"
      :lazy="true"
      :rows="serviceLogs?.meta?.per_page"
      v-model:filters="filters"
      :totalRecords="serviceLogs?.meta?.total"
      :loading="loading"
      @page="onPage($event)"
      @sort="onSort($event)"
      @filter="onFilter($event)"
      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} logs"
    >
      <template #header>
        <div class="flex justify-end">
          <div class="relative mt-1 rounded-md shadow-sm">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-5 w-5 text-gray-400"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <input
              type="text"
              name="log-search"
              id="log-search"
              autocomplete="log-search"
              class="block w-full rounded-md pl-10"
              placeholder="Search..."
              v-model="searchValue"
            />
          </div>
        </div>
      </template>
      <Column
        header="Sync ID"
        field="id"
        :showFilterMenu="false"
        :sortable="true"
      >
        <template #body="{ data: serviceLog }">
          {{ serviceLog.id }}
        </template>
      </Column>
      <Column
        header="Date/Time (UTC)"
        field="due_at"
        :showFilterMenu="false"
        :sortable="true"
      >
        <template #body="{ data: serviceLog }">
          {{ formatTime(serviceLog.started_at) }}
        </template>
      </Column>
      <Column
        :header="`Date/Time (${getAbbreviatedTimezone()})`"
        field="due_at"
        :showFilterMenu="false"
        :sortable="true"
      >
        <template #body="{ data: serviceLog }">
          {{ formatTime(serviceLog.started_at, true) }}
        </template>
      </Column>
      <Column header="Pulled Count" field="total_count" :showFilterMenu="false">
        <template #body="{ data: serviceLog }">
          {{ serviceLog.total_count }}
        </template>
      </Column>
      <Column
        v-if="integrationIsOnK8s"
        header="Pushed Count"
        field="processed_count"
        :showFilterMenu="false"
      >
        <template #body="{ data: serviceLog }">
          {{ serviceLog.processed_count }}
        </template>
      </Column>
      <Column header="Status" field="status" :showFilterMenu="false">
        <template #body="{ data: serviceLog }">
          <UiBadge :severity="getLogStatusColour(serviceLog)">
            {{ serviceLog.status }}
          </UiBadge>
        </template>
      </Column>
      <Column header="Actions" field="actions" :showFilterMenu="false">
        <template #body="{ data: serviceLog }">
          <UiDropdownMenu
            :links="[
              {
                title: 'More Details',
                action: () => openRelatedRecordModal(serviceLog),
                if: $canViewDetailedLogs(),
              },
              {
                title: 'Stop Service',
                action: () => openConfirmationModal(serviceLog),
                if: ['running', 'pending'].includes(serviceLog.status),
              },
            ]"
          />
        </template>
      </Column>
      <template #empty>No logs found</template>
    </DataTable>
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import { dateHelperMixin } from '@/mixins/date-helper-mixin';
import { stopService } from '@/lib/services';

export default defineNuxtComponent({
  name: 'ServiceLogTable',
  props: {
    serviceIds: {
      type: Array,
      required: true,
    },
    integrationIsOnK8s: {
      type: Boolean,
      required: false,
      default: false,
    },
    pastDayOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  mixins: [dateHelperMixin],
  data() {
    return {
      loading: false,
      serviceLogs: {},
      searchValue: '',
      filters: {
        page: 0,
        sortField: 'due_at',
        sortOrder: 0,
      },
      selectedServiceLog: null,
      serviceLogToKill: null,
    };
  },
  async fetch() {
    this.serviceLogs = await useFabric('/api/v2/service-logs', {
      params: this.queryParams,
    });
  },
  computed: {
    filteredLogs() {
      if (!this.serviceLogs.data) {
        return [];
      }
      return this.serviceLogs.data.filter((log) =>
        log.id.toString().includes(this.searchValue)
      );
    },
    queryParams() {
      const filters = {
        page: this.filters.page + 1,
        include: 'service.settings',
        'filter[service_id]': this.serviceIds.join(','),
      };

      if (this.filters.sortField) {
        filters['sort'] =
          this.filters.sortOrder === 1
            ? this.filters.sortField
            : `-${this.filters.sortField}`;
      }

      if (this.pastDayOnly) {
        filters['due_after'] = dayjs()
          .subtract(24, 'hour')
          .format(this.timestampFormat);
      }

      return filters;
    },
  },
  methods: {
    ...mapActions(useUiStore, ['openModal']),
    getLogStatusColour(serviceLog) {
      switch (serviceLog.status) {
        case 'complete':
          return 'success';
        case 'running':
          return 'info';
        case 'terminated':
        case 'failed':
          return 'danger';
        default:
          return 'warning';
      }
    },
    formatTime(time, isLocal = false) {
      if (time) {
        return isLocal
          ? dayjs.utc(time).local().format('DD/MM/YYYY HH:mm')
          : dayjs.utc(time).format('DD/MM/YYYY HH:mm');
      }

      return 'Not yet started';
    },
    onSort(e) {
      this.filters.sortField = e.sortField;
      this.filters.sortOrder = e.sortOrder;

      this.getServiceLogs();
    },
    onPage(e) {
      this.filters.page = e.page;

      this.getServiceLogs();
    },
    onFilter(e) {
      this.filters.page = 0;

      this.getServiceLogs();
    },
    async getServiceLogs() {
      this.loading = true;
      try {
        this.serviceLogs = await useFabric('/api/v2/service-logs', {
          params: this.queryParams,
        });
      } catch (error) {
        console.log(error);
        this.notify('error', 'Failed to load logs.');
      } finally {
        this.loading = false;
      }
    },
    openRelatedRecordModal(serviceLog) {
      this.selectedServiceLog = serviceLog;
      this.openModal('relatedRecords');
    },
    openConfirmationModal(serviceLog) {
      this.openModal('stopServiceConfirmation');
      this.serviceLogToKill = serviceLog;
    },
    async cancelService(stopRunOnly) {
      try {
        this.makingRequest = true;

        stopRunOnly
          ? await stopService(
              this.$axios,
              this.serviceLogToKill.service.id,
              this.serviceLogToKill.id
            )
          : await stopService(this.$axios, this.serviceLogToKill.service.id);

        this.makingRequest = false;
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Sorry, there was a problem sending the flag to stop this service. Error: ${error}`,
          },
          4000
        );
        this.makingRequest = false;
      }
    },
  },
});
</script>
