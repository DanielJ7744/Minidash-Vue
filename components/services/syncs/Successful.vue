<template>
  <div class="h-auto">
    <div class="relative" style="min-height: 200px">
      <LegacyTable
        :use-slot="true"
        :headings="headings"
        :hide-heading-mobile="true"
      >
        <tr
          v-for="(sync, idx) in successfulSyncs.data"
          :key="idx"
          class="mx-1 mt-3 mb-6 grid grid-cols-2 border-t border-gray-200 p-4 shadow-md md:m-0 md:table-row md:p-0 md:shadow-none"
        >
          <td class="whitespace-nowrap md:px-6 md:py-4">
            <div class="flex items-center">
              <div
                class="flex h-5 w-5 flex-shrink-0 items-center text-gray-900"
              >
                <span :class="getEntityIconClass(sync.type)" />
              </div>
              <div class="ml-2">
                <div class="text-sm font-medium text-gray-900">
                  {{ sync.type }}
                </div>
              </div>
            </div>
          </td>
          <td class="whitespace-nowrap py-3 md:px-6 md:py-4">
            <div class="block font-medium text-gray-900 md:hidden">Systems</div>
            <div class="text-sm text-gray-500">
              {{ sync.system_chain.replace(/_+/g, ' > ') }}
            </div>
          </td>
          <td
            class="whitespace-nowrap py-3 text-sm text-gray-500 md:px-6 md:py-4"
          >
            <div class="block font-medium text-gray-900 md:hidden">
              Integration Name
            </div>
            {{ sync.integration.name }}
          </td>
          <td
            class="whitespace-nowrap py-3 text-sm text-gray-500 md:px-6 md:py-4"
          >
            <div class="block font-medium text-gray-900 md:hidden">
              Date/Time
            </div>
            {{ sync.created_at | fromNow }}
          </td>
          <td
            class="col-start-2 row-start-1 flex items-center justify-end whitespace-nowrap md:justify-between md:px-6 md:py-4"
          >
            <span
              class="status-badge status-badge--ok inline-flex rounded-full bg-green-100 px-2 text-xs font-medium leading-5"
            >
              {{ sync.status }}
            </span>
            <UiDropdownMenu
              :links="[
                {
                  title: 'More Details',
                  action: () => {
                    selectedSync.data = sync;
                    getServiceLogs(sync);
                  },
                },
              ]"
            />
          </td>
        </tr>
      </LegacyTable>
      <UiLoading v-if="$fetchState.pending" />
      <div
        v-if="!$fetchState.pending && successfulSyncs.meta.total"
        class="relative h-20"
      >
        <UiLoading v-if="loading" class="mt-5 h-auto" />
        <div v-else>
          <button
            v-if="currentPage < totalPages"
            class="button button-understated mt-4 mb-4 ml-auto mr-auto block"
            @click="currentPage++"
          >
            Load More
          </button>
          <p v-else class="mt-6 text-center">No more results</p>
        </div>
        <p class="absolute top-14 left-0 right-0 text-center">
          Showing {{ resultsLoadedCount }} out of
          {{ successfulSyncs.meta.total }} results
        </p>
      </div>
    </div>
    <Modal id="successDetailsModal" title="More Details">
      <div v-if="selectedSync.serviceLogRows.length">
        <h6>Service Logs</h6>
        <LegacyTable :rows="selectedSync.serviceLogRows" />
      </div>
      <UiLoading v-else />
    </Modal>
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import { entitiesHelperMixin } from '@/mixins/entities-helper-mixin';
import { dateHelperMixin } from '@/mixins/date-helper-mixin';

export default {
  name: 'SuccessfulSyncs',
  mixins: [entitiesHelperMixin, dateHelperMixin],
  props: {
    systemName: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    loading: false,
    headings: ['Service', 'Systems', 'Integration Name', 'Date/Time', 'Status'],
    successfulSyncs: {},
    selectedSync: {
      data: {},
      serviceLogs: [],
      serviceLogRows: [],
      relatedEntities: [],
    },
    currentPage: 1,
  }),
  async fetch() {
    this.successfulSyncs = await this.getSyncReports();
    this.$emit('loaded', this.successfulSyncs);
  },
  computed: {
    totalPages() {
      let total = 0;
      if (this.successfulSyncs) {
        total = this.successfulSyncs.meta.last_page;
      }

      return total;
    },
    resultsLoadedCount() {
      if (this.successfulSyncs?.data) {
        return this.successfulSyncs.data.length;
      }

      return 0;
    },
  },
  watch: {
    currentPage() {
      this.getMoreRows();
    },
  },
  methods: {
    ...mapActions(useUiStore, ['openModal', 'closeModal']),
    generateQuery(params, isV2 = false) {
      let query = '?';

      for (const i in params) {
        if (isV2) {
          query += `&filter[${i}]=${encodeURIComponent(params[i])}`;
        } else {
          query += `&${i}=${encodeURIComponent(params[i])}`;
        }
      }

      return query;
    },
    async getServiceLogs(sync) {
      const params = {
        service_id: sync.first_service_id,
        started_after: sync.created_at,
        finished_before: sync.updated_at,
      };

      this.selectedSync.serviceLogRows = [];
      this.openModal('successDetailsModal');
      this.selectedSync.serviceLogs = await this.$axios
        .$get(
          `/api/api/v2/service-logs${this.generateQuery(
            params,
            true
          )}&include=service`
        )
        .then((response) => response.data)
        .catch(() => {
          this.closeModal('successDetailsModal');
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: 'Sorry, no service logs found.',
            },
            4000
          );
        });

      if (!this.selectedSync.serviceLogs.length) {
        this.closeModal('successDetailsModal');
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: 'Sorry, no service logs found.',
          },
          4000
        );
        return;
      }

      this.selectedSync.serviceLogs.forEach((log) => {
        this.selectedSync.serviceLogRows.push({
          run_id: log.id,
          status: log.status,
          scheduled_at: new Date(log.due_at).toLocaleString(),
          started_at: new Date(log.started_at).toLocaleString(),
          finished_at: new Date(log.finished_at).toLocaleString(),
          'time_taken_(in_seconds)':
            Math.abs(new Date(log.started_at) - new Date(log.finished_at)) /
            1000,
          filters: log.filters,
        });
      });
    },
    async getMoreRows() {
      this.loading = true;
      const res = await this.getSyncReports();
      this.loading = false;

      this.successfulSyncs.data.push(...res.data);
    },
    getSyncReports() {
      const params = {
        status: 'Ok',
        end: this.getLocalTimeNow(),
        start: this.getLocalTimeNowMinusDay(),
        system_chain: this.systemName,
        sort_field: 'created_at',
        sort_direction: 'desc',
      };

      return this.$axios
        .$get(
          `/api/api/v2/sync-reports${this.generateQuery(params, true)}&page=${
            this.currentPage
          }`
        )
        .then((response) => response);
    },
  },
};
</script>
