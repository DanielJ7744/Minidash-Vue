<template>
  <div>
    <div class="one-column-grid">
      <div
        :class="{
          'card card--content-to-edges card--no-shadow': allowFilteringAndSort,
        }"
      >
        <div
          v-if="integrationsWithoutResults.length > 0 && filterOptionsLoaded"
          class="card__padded-content"
        >
          <div class="message message--notice">
            <div>
              <div class="message__header">
                <span class="icon icon--error-circle" />
                Some Integrations failed to return results
              </div>
              <ul>
                <li
                  v-for="integration in integrationsWithoutResults"
                  :key="integration.integration_id"
                >
                  {{ integration.integration_name }} ({{
                    integration.integration_username
                  }}): {{ integration.message }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <div v-if="allowFilteringAndSort && filterOptionsLoaded">
            <Modal
              id="downloadCsv"
              title="Download as CSV?"
              classes="modal--small"
            >
              <p class="mb-5">{{ totalResults }} Sync Reports selected</p>
              <div>
                <button
                  type="button"
                  class="button button-secondary"
                  @click="closeModal()"
                >
                  Cancel
                </button>
                <a
                  class="button button-primary"
                  type="button"
                  style="min-width: 102px"
                  target="_blank"
                  @click="downloadCsv()"
                >
                  Export
                </a>
              </div>
            </Modal>
          </div>
          <TableSyncs
            :syncs="entities"
            :filters="filters"
            :loading="!initialDataLoaded"
            :filter-options="filterOptions"
            :column-options="{
              showActions,
              showAdditionalFields,
            }"
            v-model:showAdditionalSyncData="showAdditionalSyncData"
            v-model:selected="selectedEntities"
            v-model:search-term="filters.search_term"
            @triggerAutoSync="autoResyncEntities()"
            @openFailedSyncDialogue="openFailedSyncDialogue($event)"
            @launchDownloadCsv="launchDownloadCsv()"
          />
        </div>

        <div
          v-if="allowPagination && initialDataLoaded"
          class="m-4 flex flex-col items-center justify-center"
        >
          <div class="mb-2">
            Showing {{ resultsLoadedCount }} out of {{ totalResults }} results
            <br />
          </div>

          <div v-if="errorLoadingNextPage" class="message message--fail">
            Error loading next page
          </div>

          <div class="pagination-loader__button-bar">
            <button
              class="button button-secondary"
              :disabled="!canLoadMore"
              @click="loadNextPage"
            >
              {{ canLoadMore ? `Load More` : `No more results` }}
            </button>
          </div>
        </div>
        <Modal
          id="autoResyncEntities"
          title="Auto Resync"
          classes="modal--small"
        >
          <div class="one-column-grid">
            <div v-if="multiResyncIsComplete" class="one-column-grid">
              <div class="message message--success">
                Resyncing completed successfully!
              </div>
            </div>
            <div v-else class="one-column-grid">
              <div
                v-for="currentSelectedEntity in entitiesWithoutResyncValues"
                :key="currentSelectedEntity.id"
                class="one-column-grid"
              >
                <div class="message message--notice">
                  The
                  {{
                    currentSelectedEntity.system_chain
                      .split('_')[0]
                      .toLowerCase()
                  }}
                  {{ currentSelectedEntity.type.toLowerCase() }}
                  {{ currentSelectedEntity.common_ref }} ({{
                    currentSelectedEntity.source_id
                  }}) can not be resynced from the dashboard, please contact
                  support.
                </div>
              </div>
              <div
                v-if="entitiesWithResyncValues.length"
                class="one-column-grid"
              >
                <div class="one-column-grid">
                  <div
                    v-if="entitiesWithoutResyncValues.length"
                    class="one-column-grid"
                  >
                    <p><b>Would you still like to resync the following?</b></p>
                  </div>
                  <div v-else class="one-column-grid">
                    <p>
                      <b
                        >Are you sure you would like to resync the following?</b
                      >
                    </p>
                  </div>
                </div>
                <div class="one-column-grid">
                  <div
                    v-for="currentSelectedEntity in entitiesWithResyncValues"
                    :key="currentSelectedEntity.id"
                  >
                    <p>
                      {{ currentSelectedEntity.system_chain.split('_')[0] }}
                      {{ currentSelectedEntity.type.toLowerCase() }}
                      {{ currentSelectedEntity.common_ref }} ({{
                        currentSelectedEntity.source_id
                      }})
                    </p>
                  </div>
                </div>
                <div class="one-column-grid">
                  <form
                    @submit.prevent="
                      runServiceClickedMultiple(entitiesWithResyncValues)
                    "
                  >
                    <input
                      type="submit"
                      class="button button--primary"
                      :value="
                        multiResyncIsSubmitting ? `Resyncing...` : `Resync`
                      "
                      :disabled="multiResyncIsSubmitting"
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        <Modal id="failed_sync_dialogue" title="Failed Sync Details" size="lg">
          <template v-if="selectedEntity">
            <div class="one-column-grid">
              <table class="minimal-table">
                <tr>
                  <td
                    class="minimal-table__column--20pc minimal-table__column--emphasis minimal-table__column--bold"
                  >
                    System
                  </td>
                  <td>
                    {{ selectedEntity.system_chain }}
                  </td>
                </tr>
                <tr>
                  <td
                    class="minimal-table__column--20pc minimal-table__column--emphasis minimal-table__column--bold"
                  >
                    Common Ref
                  </td>
                  <td>
                    {{ selectedEntity.common_ref }}
                  </td>
                </tr>
                <tr>
                  <td
                    class="minimal-table__column--20pc minimal-table__column--emphasis minimal-table__column--bold"
                  >
                    Source Id
                  </td>
                  <td>
                    {{ selectedEntity.source_id }}
                  </td>
                </tr>
                <tr>
                  <td
                    class="minimal-table__column--20pc minimal-table__column--emphasis minimal-table__column--bold"
                  >
                    Status
                  </td>
                  <td>
                    <span
                      class="status-badge"
                      :class="`status-badge--${selectedEntity.status}`"
                    >
                      {{ selectedEntity.status }}
                    </span>
                  </td>
                </tr>
                <tr v-if="selectedEntity.status === 'Failed'">
                  <td
                    class="minimal-table__column--20pc minimal-table__column--emphasis minimal-table__column--bold"
                  >
                    Failure Reason / Error
                  </td>
                  <td>
                    {{
                      selectedEntity.message ? selectedEntity.message : 'none'
                    }}
                  </td>
                </tr>
              </table>

              <div v-if="!runId">
                <div
                  v-if="selectedEntity.resync_values !== null"
                  class="inline-flex"
                >
                  <form
                    class="inline-flex"
                    @submit.prevent="runServiceClicked(selectedEntity)"
                  >
                    <div class="form_item">
                      <input
                        type="submit"
                        class="button button--primary"
                        :value="`ReSync ${selectedEntityFirstSystem.toLowerCase()} ${selectedEntityType.toLowerCase()} \'${
                          selectedEntity.resync_values.filter_values[0]
                        }\' to ${selectedEntitySecondSystem.toLowerCase()}`"
                        :disabled="
                          resyncIsSubmitting ||
                          selectedEntity.resync_values === null
                        "
                      />
                    </div>
                  </form>
                </div>
                <div v-else class="message message--notice">
                  This {{ selectedEntityType.toLowerCase() }} can not be
                  resynced from the dashboard, please contact support.
                </div>
                <form
                  v-if="$patchworksAdmin()"
                  class="inline-flex pl-1"
                  @submit.prevent="runGetExternalLogs(selectedEntity)"
                >
                  <div class="form_item">
                    <input
                      type="submit"
                      class="button button--primary"
                      value="View Service Logs"
                    />
                  </div>
                </form>
              </div>
              <div v-else class="one-column-grid">
                <div class="message message--success">
                  {{ successMessage }}
                </div>
              </div>
              <div class="one-column-grid">
                <PageConnectionsServicesRunLogTable
                  v-if="selectedEntity.last_run_id"
                  :run-id="selectedEntity.last_run_id"
                  :run-logs="selectedServiceRuns"
                />
              </div>
            </div>
          </template>
        </Modal>
        <Modal
          id="servicelogs"
          title="Service Run Logs"
          classes="modal"
          size="lg"
        >
          <TableServiceLogs
            :entity-log="selectedEntity"
            :service-ids="[selectedEntity.last_run_id]"
          />
        </Modal>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import dayjs from 'dayjs';
import { entitiesHelperMixin } from '@/mixins/entities-helper-mixin';
import { dateHelperMixin } from '@/mixins/date-helper-mixin';

export default {
  name: 'EntitiesTable',
  mixins: [entitiesHelperMixin, dateHelperMixin],
  props: {
    allowPagination: {
      type: Boolean,
      default: true,
    },
    allowFilteringAndSort: {
      type: Boolean,
      default: true,
    },
    showInlineErrors: {
      type: Boolean,
      default: true,
    },
    showActions: {
      type: Boolean,
      default: false,
    },
    entityTypes: {
      type: Array,
      required: false,
      default: () => {
        return [];
      },
    },
    initialFilters: {
      type: Object,
      required: false,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      runEndpoint: '/api/api/v1/service-logs',
      runId: null,
      resyncIsSubmitting: false,
      multiResyncIsSubmitting: false,
      multiResyncIsComplete: false,
      initialDataLoaded: false,
      errorLoadingInitialData: false,
      errorLoadingNextPage: false,
      entities: [],
      currentPage: 1,
      entitiesPreLoaded: null,
      integrationsWithoutResults: [],
      loadedPage: 0,
      nextPage: null,
      previousPage: null,
      totalPages: null,
      totalResults: 0,
      resultsOffset: null,
      showAdditionalSyncData: false,
      showAdditionalFields: false,
      filters: {
        days: 1,
        integrations: 0,
        status: null,
        type: 'all',
        system_chain: null,
        search_term: '',
        sort_field: 'created_at',
        sort_direction: 'desc',
      },
      maxDaysForFilter: 15,
      // options for filters
      filterOptionsLoaded: false,
      filterOptions: {
        companyGroups: [],
        availableEntities: [],
        statuses: ['Pending', 'Sent', 'Ok', 'Failed'],
        systems: [],
      },
      filterOptionsIntegrations: [],
      filterOptionsSystemChains: [],
      // filterOptionsConnectorSystems: [],
      filterOptionsSystems: {
        source: null,
        destination: null,
      },
      selectedEntity: null,
      showRunLog: false,
      filterSidebarOpen: false,
      dropdownFiltersStatusActive: true,
      dropdownFiltersTypeActive: true,
      dropdownFiltersSystemActive: true,
      filterImmediatelyFlag: false,
      selectedEntities: [],
      pagesPerIntegration: null,
      responses: [],
      pageSize: null,
      typeFilters: [
        {
          database_name: 'Order',
          factory_name: 'Orders',
        },
        {
          database_name: 'Fulfilment',
          factory_name: 'Fulfilments',
        },
        {
          database_name: 'Product',
          factory_name: 'Products',
        },
        {
          database_name: 'Customer',
          factory_name: 'Customers',
        },
        {
          database_name: 'PurchaseOrder',
          factory_name: 'PurchaseOrders',
        },
        {
          database_name: 'Refund',
          factory_name: 'Refunds',
        },
        {
          database_name: 'InventoryAdjustment',
          factory_name: 'InventoryAdjustments',
        },
        {
          database_name: 'ItemReceipt',
          factory_name: 'ItemReceipts',
        },
        {
          database_name: 'GoodsReceipt',
          factory_name: 'GoodsReceipts',
        },
        {
          database_name: 'Return',
          factory_name: 'Returns',
        },
        {
          database_name: 'Stocklevels',
          factory_name: 'Stocklevels',
        },
        {
          database_name: 'WholesaleOrder',
          factory_name: 'WholesaleOrders',
        },
        {
          database_name: 'TransferOrder',
          factory_name: 'TransferOrders',
        },
        {
          database_name: 'OrdersRebound',
          factory_name: 'OrdersRebound',
        },
        {
          database_name: 'InventoryItem',
          factory_name: 'InventoryItem',
        },
        {
          database_name: 'CreditMemo',
          factory_name: 'CreditMemos',
        },
        {
          database_name: 'ProductsRefactored',
          factory_name: 'ProductsRefactored',
        },
        {
          database_name: 'TimestampStock',
          factory_name: 'TimestampStock',
        },
        {
          database_name: 'Stock',
          factory_name: 'Stock',
        },
        {
          database_name: 'Sale',
          factory_name: 'Sales',
        },
        {
          database_name: 'InventoryTransfer',
          factory_name: 'InventoryTransfers',
        },
        {
          database_name: 'InboundShipments',
          factory_name: 'InboundShipments',
        },
        {
          database_name: 'OrdersTrade',
          factory_name: 'OrdersTrade',
        },
      ],
    };
  },
  computed: {
    selectedServiceRuns() {
      return [
        {
          runId: this.selectedEntity.last_run_id,
          integrationUsername: this.selectedEntity.integration
            ? this.selectedEntity.integration.username
            : 'No username found',
        },
      ];
    },
    selectedEntityFirstSystem() {
      return this.selectedEntity.system_chain.split('_')[0];
    },
    selectedEntitySecondSystem() {
      return this.selectedEntity.system_chain.split('_')[1];
    },
    selectedEntityType() {
      return this.selectedEntity.type;
    },
    filterOptionsIntegrationsSelected() {
      return this.filters.integrations;
    },
    integrationAllSelected() {
      return (
        this.filterOptionsIntegrations.length ===
        this.filters.integrations.length
      );
    },
    hasNoIntegrations() {
      return (
        this.initialDataLoaded &&
        this.filterOptionsLoaded &&
        this.filterOptionsIntegrations.length < 1
      );
    },
    resultsLoadedCount() {
      return this.entities.length;
    },
    canLoadMore() {
      return (
        this.totalResults > 0 && this.resultsLoadedCount < this.totalResults
      );
    },
    filterErrors() {
      return {
        integrations: this.filters.integrations.length < 1,
        days:
          (this.filters.days < 1 && this.filters.updated_at_days < 1) ||
          this.filters.days > this.maxDaysForFilter,
        updated_at_days:
          (this.filters.days < 1 && this.filters.updated_at_days < 1) ||
          this.filters.updated_at_days > this.maxDaysForFilter,
      };
    },
    hasFilterErrors() {
      const filtersWithErrors = Object.entries(this.filterErrors).filter(
        ([filterName, hasErrors]) => hasErrors === true
      );
      return filtersWithErrors.length > 0;
    },
    typeFilterTabs() {
      return this.typeFilters.map((type) => ({
        label: type.factory_name,
        key: type.database_name,
      }));
    },
    runIds() {
      const runIds = {};
      this.entities.forEach((entity) => {
        const matchingFirstRunData = this.serviceLogData.find(
          (serviceLog) => serviceLog.id === entity.first_run_id
        );
        const matchingLastRunData = this.serviceLogData.find(
          (serviceLog) => serviceLog.id === entity.last_run_id
        );
        if (!(entity.integration.username in runIds)) {
          runIds[entity.integration.username] = [];
        }
        if (!matchingFirstRunData) {
          runIds[entity.integration.username].push(entity.first_run_id);
        }

        if (!matchingLastRunData) {
          runIds[entity.integration.username].push(entity.last_run_id);
        }
      });
      for (const [key, value] of Object.entries(runIds)) {
        runIds[key] = value.filter(
          (value, index, self) => self.indexOf(value) === index
        );
      }

      return runIds;
    },
    csvUrl() {
      return `/api/api/v2/sync-reports${this.generateQuery(
        this.filters,
        true
      )}&exportCsv=true`;
    },
    entitiesWithResyncValues() {
      return this.selectedEntities.filter((e) => e.resync_values !== null);
    },
    entitiesWithoutResyncValues() {
      return this.selectedEntities.filter((e) => e.resync_values === null);
    },
  },
  watch: {
    filters: {
      handler() {
        this.loadInitialPage();
      },
      deep: true,
    },
    showAdditionalSyncData() {
      if (
        Object.keys(this.runIds).length !== 0 &&
        this.showAdditionalSyncData === true
      ) {
        this.getServiceLogData(this.runIds);
      }
    },
    filterOptionsSystems: {
      handler(systems) {
        if (systems.source && systems.destination) {
          this.filters.system_chain =
            systems.source + '_' + systems.destination;
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.onLoad();
  },
  methods: {
    ...mapActions(useUiStore, ['openModal', 'closeModal']),
    delay(callback, delay) {
      setTimeout(() => callback(), delay);
    },
    integrationSelected(intergrationId) {
      this.filters.integrations = intergrationId;
    },
    showServiceLogData(runId) {
      if (this.serviceLogDataLoaded === false) {
        return 'Loading data...';
      }

      const matchingServiceLogData = this.serviceLogData.find(
        (serviceLog) => serviceLog.id === runId
      );
      if (!matchingServiceLogData) {
        return 'No matching data found';
      }
      const formattedDate = new Date(
        matchingServiceLogData.started_at
      ).toLocaleString('en-GB', {
        day: 'numeric',
        year: 'numeric',
        month: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      });
      return `Sync started at ${formattedDate} and took ${matchingServiceLogData.runtime}s`;
    },
    closeRunService() {
      this.$emit('run-service-close');
    },
    viewRunLog() {
      this.showRunLog = true;
    },
    runServiceClicked(selectedEntity) {
      // trigger 'are you sure' dialogue
      const confirmed = window.confirm(
        `This will resync ${selectedEntity.system_chain
          .split('_')[0]
          .toLowerCase()} ${selectedEntity.type.toLowerCase()} ${
          selectedEntity.resync_values?.filter_values?.[0]
        } to ${selectedEntity.system_chain
          .split('_')[1]
          .toLowerCase()} - click 'ok' to proceed`
      );
      if (confirmed) {
        this.resyncIsSubmitting = false;
        this.submitRunService(selectedEntity);
      }
    },
    runGetExternalLogs(selectedEntity) {
      this.openModal('servicelogs');
    },
    runServiceClickedMultiple(selectedEntities) {
      const self = this;
      self.closeModal('autoResyncEntities');
      selectedEntities.forEach(function (entity) {
        self.submitRunService(entity);
      });
    },
    submitRunService(selectedEntity) {
      this.validationErrors = null;
      this.resyncIsSubmitting = true;
      this.$axios
        .post(
          this.runEndpoint,
          {
            data: {
              type: 'service-logs',
              attributes: {
                serviceId: selectedEntity.first_service_id,
                integrationUsername: selectedEntity.integration.username,
                filterTemplateId:
                  selectedEntity.resync_values.filter_template_id,
                filterValues: selectedEntity.resync_values.filter_values,
                integrationId: selectedEntity.integration.id,
              },
            },
          },
          { headers: { 'Content-Type': 'application/vnd.api+json' } }
        )
        .then((response) => {
          const responseData = response.data;
          this.successMessage = responseData.message;

          // store returned run log data
          this.runId = responseData.service_log.run_id;
          this.$emit('run-service-success', {
            runId: this.runId,
            integrationUsername: this.service.integration.username,
            serviceId: this.service.id,
          });
        })
        .catch(({ response }) => {
          if (response.data && response.data.error_message) {
            this.$notify(
              {
                group: 'notifications',
                type: 'error',
                text: response.data.error_message,
              },
              4000
            );
          } else {
            // generic error message
            this.$notify(
              {
                group: 'notifications',
                type: 'error',
                text: 'Sorry, there was a problem scheduling the service run',
              },
              4000
            );
          }
          this.validationErrors = response.data.errors;
        })
        .finally(() => {
          this.resyncIsSubmitting = false;
        });
    },
    selectionChanged() {
      this.selectedEntities = this.$refs['entities-table'].selectedRows;
    },
    autoResyncEntities() {
      this.openModal('autoResyncEntities');
    },
    launchDownloadCsv() {
      if (this.totalResults) {
        return this.openModal('downloadCsv');
      }

      this.$notify(
        {
          group: 'notifications',
          type: 'error',
          text: 'Sorry, no data available for export',
        },
        4000
      );
    },
    changeFilterSidebarStatus() {
      this.filterSidebarOpen = !this.filterSidebarOpen;
    },
    openFailedSyncDialogue(entity) {
      this.selectedEntity = entity;
      this.openModal('failed_sync_dialogue');
    },
    formatSystemChain(name) {
      return name.replace('_', ' → ');
    },
    clearFilter(filterName) {
      this.filters[filterName] = null;
    },
    clearFilterIndividual(targetFilter) {
      switch (targetFilter) {
        case 'days':
          this.filters.days = 1;

          break;
        case 'type':
          this.filters.type = 'all';

          break;
        default:
          this.clearFilter(targetFilter);
          break;
      }

      this.loadInitialPage();
    },
    populateInitialFilters() {
      const initialFilters = this.initialFilters;
      if (
        initialFilters.integrations &&
        !Array.isArray(initialFilters.integrations)
      ) {
        console.warn(
          'prop initialFilters.integrations must be an array - value will be ignored'
        ); //eslint-disable-line
        initialFilters.integrations = [];
      }
      this.filters = { ...this.filters, ...initialFilters };
    },
    preselectIntegration() {
      // if filtering on, and no integration currently selected
      if (this.allowFilteringAndSort) {
        const firstIntegration = this.filterOptionsIntegrations[0];
        if (firstIntegration) {
          this.filters.integrations = firstIntegration.id.toString();
        }
      }
    },
    async onLoad(status) {
      if (status === 'companyChanged') {
        this.initialDataLoaded = false;
        this.filterOptionsLoaded = false;
        this.filters.integrations = [];
        this.filterOptionsIntegrations = [];
        this.filterOptionsSystemChains = [];
      }
      await Promise.all([this.getIntegrations(), this.getConnectorSystems()]);

      this.filterOptionsLoaded = true;
      this.populateInitialFilters();
      this.preselectIntegration();
      this.loadInitialPage();
    },
    loadInitialPage() {
      this.getSyncReports(1);
      this.filterSidebarOpen = false;
      this.initialDataLoaded = false;
      this.errorLoadingInitialData = false;
      this.integrationsWithoutResults = [];
      this.filterImmediatelyFlag = false;
    },
    clearFilters() {
      this.filters.days = 1;
      this.filters.integrations = [];
      this.filters.status = null;
      this.filters.type = 'Order';
      this.filters.system_chain = null;
      this.preselectIntegration();
      this.loadInitialPage();
    },
    loadNextPage() {
      this.currentPage++;
      this.getSyncReports(this.currentPage);
    },
    toggleDropdownFiltersStatus() {
      this.dropdownFiltersStatusActive = !this.dropdownFiltersStatusActive;
    },
    toggleDropdownFiltersType() {
      this.dropdownFiltersTypeActive = !this.dropdownFiltersTypeActive;
    },
    toggleDropdownFiltersSystem() {
      this.dropdownFiltersSystemActive = !this.dropdownFiltersSystemActive;
    },
    updateSortFilters(payload) {
      this.filters.sort_field = payload.field;
      this.filters.sort_direction = payload.direction;

      this.loadInitialPage();
    },
    generateQuery(params, isV2 = false) {
      let query = '?';

      for (const i in params) {
        if (isV2) {
          if (params[i] && params[i] !== 'null') {
            query += `&filter[${i}]=${params[i]}`;
          }
        } else {
          query += `&${i}=${params[i]}`;
        }
      }

      return query;
    },
    getSyncReports(page) {
      this.$axios
        .$get(
          `/api/api/v2/sync-reports${this.generateQuery(
            this.filters,
            true
          )}&page=${page}`
        )
        .then((res) => {
          const entitiesFromRes = this.formatEntityDates(res.data);
          if (page > 1) {
            this.entities = [...this.entities, ...entitiesFromRes];
          } else {
            this.entities = entitiesFromRes;
            if (!this.entities.length) {
              this.initialDataLoaded = true;
              this.totalResults = res.meta.total;
              return;
            }

            this.totalResults = res.meta.total;
            this.initialDataLoaded = true;
            this.currentPage = 1;
            this.filterOptions.availableEntities = [
              {
                label: 'All',
                key: 'all',
              },
              ...this.typeFilterTabs.filter((tab) => {
                return res.meta.available_entities.includes(tab.key);
              }),
            ];
          }
          if (
            Object.keys(this.runIds).length !== 0 &&
            this.showAdditionalSyncData === true
          ) {
            this.getServiceLogData(this.runIds);
          }
        })
        .catch((e) => {
          console.error('Error Retrieving Sync Reports', e); // eslint-disable-line
        });
    },
    formatEntityDates(entities) {
      return entities.map((entity) => {
        if (!entity.created_at) {
          return entity;
        }
        entity.local_time = dayjs
          .utc(entity.created_at)
          .local()
          .format('DD/MM/YYYY HH:mm');
        entity.created_at = dayjs
          .utc(entity.created_at)
          .format('DD/MM/YYYY HH:mm');
        return entity;
      });
    },
    async getIntegrations() {
      try {
        const integrations = await this.$axios
          .$get('/api/api/v2/integrations')
          .then((r) => r.data);

        this.filterOptionsIntegrations = integrations;

        this.filterOptions.companyGroups = integrations.map(
          (integration) =>
            (integration = {
              key: integration.id.toString(),
              label: integration.name,
            })
        );
      } catch (e) {
        console.error('Error Loading integration filter options', e); // eslint-disable-line
      }
    },
    async getConnectorSystems() {
      try {
        const connectors = await this.$axios
          .$get('/api/api/v2/connectors')
          .then((r) => r.data);

        this.filterOptions.systems = [
          ...new Set(
            connectors
              .filter((c) => {
                return c !== null;
              })
              .map((c) => {
                return c.system.factory_name;
              })
          ),
        ];
      } catch (e) {
        console.error('Error Loading system filter options', e); // eslint-disable-line
      }
    },
    downloadCsv() {
      this.$axios.get(this.csvUrl).then((response) => {
        const fileURL = window.URL.createObjectURL(new Blob([response.data]));
        const fileLink = document.createElement('a');

        fileLink.href = fileURL;
        fileLink.setAttribute('download', 'sync-reports.csv');
        document.body.appendChild(fileLink);
        fileLink.click();
        this.closeModal();
      });
    },
  },
};
</script>
