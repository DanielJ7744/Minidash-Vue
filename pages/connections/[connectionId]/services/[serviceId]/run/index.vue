<template>
  <div class="page-container-fluid page-container space-y-5">
    <PageHeader>
      <template #title>Run service</template>
      <template #description>
        Use this page to run a service using custom filters and options
      </template>
    </PageHeader>

    <UiLoading v-if="$fetchState.pending" class="relative h-36" />
    <UiError
      v-else-if="$fetchState.error"
      class="relative h-36"
      message="An error occurred."
    />
    <form v-else @submit.prevent="runServiceConfirm">
      <Modal
        id="runServiceConfirmation"
        :close-on-backdrop-click="false"
        classes="modal--small"
        title="Are you sure you want to run this service?"
      >
        <PageConnectionsServicesRunServiceConfirmModal
          :has-ids-to-filter="!!idsToSyncArray.length"
          :merge-service-filters="mergeServiceFilters"
          @runConfirm="runService"
        />
      </Modal>

      <Modal
        id="saveServiceConfirmation"
        :close-on-backdrop-click="false"
        classes="modal--small"
        title="Are you sure you want to save this service?"
      >
        <PageConnectionsServicesRunSaveServiceConfirmationModal
          @saveConfirm="updateService"
        />
      </Modal>

      <Modal
        id="stopServiceConfirmation"
        :close-on-backdrop-click="false"
        classes="modal--small"
        title="Are you sure you want to stop this service?"
      >
        <PageConnectionsServicesRunStopServiceConfirmationModal
          @stopService="cancelService(false)"
          @stopLatestRun="cancelService(true)"
        />
      </Modal>

      <UiLoading v-if="makingRequest" class="relative h-36" />

      <div v-else>
        <template v-if="!integrationIsOnK8s && filterTemplate">
          <UiTitledCard title="Filter by unique ID">
            <form class="one-column-grid">
              <label class="form-item__label" for="entity_ids">
                Enter Id's ({{ filterTemplate.filter_key }}) to sync (one per
                line)
              </label>
              <textarea id="entity_ids" v-model="idsToSync" />
              <div v-if="filterTemplate.note" class="form-item__hint">
                {{ filterTemplate.note }}
              </div>
            </form>
            <FormLabelledToggle
              v-model="mergeServiceFilters"
              toggle-header="Merge Service Filters"
              toggle-description="Merge the default service filters with the manual run filters."
              :disable-toggle="isRunServiceDisabled"
            />
          </UiTitledCard>
          <hr />
        </template>
        <div v-if="integrationIsOnK8s">
          <UiTitledCard v-if="filterFields.length" title="Service Filters">
            <div class="mb-2 flex items-center justify-end">
              <button
                v-if="$can('json editor')"
                type="button"
                class="button button-secondary"
                @click="toggleAdvancedEditor"
              >
                {{
                  useAdvancedFilterEditor ? 'Go Back' : 'Use Advanced Editor'
                }}
              </button>
            </div>
            <ServicesSettingsServiceFilterSettingsAdvanced
              v-if="useAdvancedFilterEditor"
              v-model="advancedServiceFilters"
              :service="service"
            />
            <ServicesSettingsServiceFilterSettings
              v-else
              v-model="serviceFilters"
              :filter-fields="filterFields"
              :service="service"
            />
          </UiTitledCard>

          <hr />

          <UiTitledCard title="From Options">
            <PageConnectionsServicesDataSettings
              ref="fromOptions"
              v-model="serviceFromOptions"
              hide-save-button
              direction="source"
              :selected-factory-system="sourceFactorySystem"
              :selected-service-template="serviceTemplate"
              :show-fields-as-required="false"
            />
          </UiTitledCard>

          <hr />

          <UiTitledCard title="To Options">
            <PageConnectionsServicesDataSettings
              ref="toOptions"
              v-model="serviceToOptions"
              hide-save-button
              direction="destination"
              :selected-factory-system="destinationFactorySystem"
              :selected-service-template="serviceTemplate"
              :show-fields-as-required="false"
            />
          </UiTitledCard>

          <hr />

          <UiTitledCard title="Service Options">
            <FormLabelledToggle
              v-model="stopServiceBeforePush"
              toggle-header="Stop Service before PUSH"
              toggle-description="Stop the service from running before pushing to the destination."
              :disable-toggle="isRunServiceDisabled"
            />
            <FormLabelledToggle
              v-model="forceService"
              toggle-header="Force Service"
              toggle-description="Ignore the retry limit set on the service."
              :disable-toggle="isRunServiceDisabled"
            />
            <FormLabelledToggle
              v-model="storePullPayload"
              toggle-header="Store Pull Payload"
              toggle-description="Store the pull payload at the time of the first transform."
              :disable-toggle="isRunServiceDisabled"
            />
            <FormLabelledToggle
              v-model="storePushPayload"
              toggle-header="Store Push Payload"
              toggle-description="Store the push payload at the time of the second transform."
              :disable-toggle="isRunServiceDisabled"
            />
            <div class="relative z-0">
              <FormLabelledToggle
                v-model="storeCustomScriptPayload"
                toggle-header="Store Custom Script Payloads"
                toggle-description="Store the input and output of a custom script."
                :disable-toggle="!showCustomScripts || !serviceHasCustomScript"
              />
              <div
                v-if="!showCustomScripts || !serviceHasCustomScript"
                class="absolute inset-0 z-10 bg-gray-100 opacity-30"
              />
            </div>
          </UiTitledCard>

          <hr />
        </div>
      </div>
      <div class="flex justify-between">
        <div>
          <button
            v-if="integrationIsOnK8s"
            type="button"
            class="button button-danger"
            :disabled="!serviceRunId"
            @click="openModal('stopServiceConfirmation')"
          >
            Stop Service
          </button>
        </div>
        <div class="flex gap-x-2">
          <button
            v-if="integrationIsOnK8s"
            type="button"
            class="button button-secondary"
            @click="saveServiceConfirm"
          >
            Save Settings to this Service
          </button>
          <button
            type="submit"
            :disabled="isRunServiceDisabled"
            class="button button-primary"
          >
            Run Service
          </button>
        </div>
      </div>
      <hr />
      <UiTitledCard title="Service Log">
        <PageConnectionsServicesRunLogTable
          v-if="serviceRunId"
          :run-id="serviceRunId"
          @service-log-loaded="setLoadedServiceLog"
        />
        <div v-else class="text-sm">Service has not yet run</div>
      </UiTitledCard>

      <hr />
      <UiTitledCard title="Payloads">
        <div class="flex justify-between">
          <div v-tooltip.top="getTooltipMessage('payload', 'pull')">
            <button
              type="button"
              class="button button-primary"
              :disabled="!shouldShowDownloadPayloadButton(storePullPayload)"
              @click="downloadPayload('pull', 'translate')"
            >
              Download Pull Payload
            </button>
          </div>
          <div v-tooltip.top="getTooltipMessage('payload', 'push')">
            <button
              type="button"
              class="button button-primary"
              :disabled="!shouldShowDownloadPayloadButton(storePushPayload)"
              @click="downloadPayload('push', 'translate')"
            >
              Download Push Payload
            </button>
          </div>
        </div>
      </UiTitledCard>

      <hr />
      <UiTitledCard title="Custom Script Payload">
        <div class="flex justify-between">
          <div v-tooltip.top="getTooltipMessage('custom-script')">
            <button
              type="button"
              class="button button-primary"
              :disabled="!showCustomScriptPayloadDownloadButton"
              @click="downloadPayload('pull', 'custom-script')"
            >
              Download Custom Script Input Payload
            </button>
          </div>
          <div v-tooltip.top="getTooltipMessage('custom-script')">
            <button
              type="button"
              class="button button-primary"
              :disabled="!showCustomScriptPayloadDownloadButton"
              @click="downloadPayload('push', 'custom-script')"
            >
              Download Custom Script Output Payload
            </button>
          </div>
        </div>
      </UiTitledCard>
    </form>
  </div>
</template>

<script>
import { stopService } from '@/lib/services';
import { mapActions, mapState } from 'pinia';
import plans from '@/enums/Plans';

export default {
  name: 'Run',
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      filterTemplate: null,
      makingRequest: false,
      idsToSync: null,
      serviceRunId: null,
      loadedServiceLog: null,
      useAdvancedFilterEditor: false,
      filterFields: [],
      advancedServiceFilters: [],
      serviceFilters: [],
      serviceFromOptions: {},
      serviceToOptions: {},
      forceService: false,
      stopServiceBeforePush: false,
      storePullPayload: false,
      storePushPayload: false,
      mergeServiceFilters: false,
      storeCustomScriptPayload: false,
    };
  },
  async fetch() {
    if (this.service.source_factory_system) {
      const filterTemplateResponse = await this.$axios
        .$get('/api/api/v2/filter-templates', {
          params: {
            'filter[factory_system_id]': this.service.source_factory_system.id,
          },
        })
        .then((r) => r.data);

      if (filterTemplateResponse.length) {
        this.filterTemplate = filterTemplateResponse[0];
      }
    }

    this.setDefaultServiceOptionValues();

    if (this.service.source_factory_system) {
      this.filterFields = await fetchAllPaginatedResults(
        this.$axios,
        '/api/api/v2/filter-fields',
        {
          'filter[factory_system_id]': this.service.source_factory_system.id,
          include:
            'factorySystem,filterOperator,filterType.filterOperator,defaultType,defaultOperator',
          perPage: 100,
        }
      );
    }
  },
  computed: {
    ...mapState(useSubscriptionStore, ['plans']),
    serviceTemplate() {
      return this.service?.service_template;
    },
    sourceFactorySystem() {
      return this.service?.source_factory_system;
    },
    destinationFactorySystem() {
      return this.service?.destination_factory_system;
    },
    integrationIsOnK8s() {
      return this.service.integration.server.endsWith('-k8s');
    },
    defaultTimeZone() {
      return dayjs.tz.guess();
    },
    idsToSyncArray() {
      if (!this.idsToSync) {
        return [];
      }
      // split into array by line breaks
      return this.idsToSync
        .replace(/\r\n/g, '\n')
        .split('\n')
        .filter((line) => line);
    },
    isRunServiceDisabled() {
      return (
        this.makingRequest ||
        ['pending', 'running'].includes(this.loadedServiceLog?.status)
      );
    },
    combinedFromOptions() {
      const newFromOptions = this.serviceFromOptions;
      if (this.useAdvancedFilterEditor && this.advancedServiceFilters) {
        newFromOptions.filters = this.advancedServiceFilters;
      }
      if (!this.useAdvancedFilterEditor && this.serviceFilters) {
        newFromOptions.filters = this.serviceFilters;
      }
      return newFromOptions;
    },
    serviceRunPayload() {
      const payload = {
        from_options: this.combinedFromOptions,
        to_options: this.serviceToOptions,
      };

      if (this.idsToSyncArray.length) {
        payload.filter_template_id = this.filterTemplate.id;
        payload.filter_values = this.idsToSyncArray;
      }

      if (!this.integrationIsOnK8s) {
        payload.requested_by = 'resync';
      }

      return payload;
    },
    runtimeFlagPromises() {
      const promises = [];
      if (!this.serviceRunId) {
        return [];
      }

      if (this.mergeServiceFilters) {
        promises.push(
          this.$axios.$post(
            `/api/api/v2/services/${this.service.id}/runtime-flags`,
            {
              service_log_id: this.serviceRunId,
              type: 'include_credential_filters',
            }
          )
        );
      }

      if (this.forceService) {
        promises.push(
          this.$axios.$post(
            `/api/api/v2/services/${this.service.id}/runtime-flags`,
            {
              service_log_id: this.serviceRunId,
              type: 'force_service',
            }
          )
        );
      }

      if (this.stopServiceBeforePush) {
        promises.push(
          this.$axios.$post(
            `/api/api/v2/services/${this.service.id}/runtime-flags`,
            {
              service_log_id: this.serviceRunId,
              type: 'stop_service_before_push',
            }
          )
        );
      }

      if (this.storePullPayload) {
        promises.push(
          this.$axios.$post(
            `/api/api/v2/services/${this.service.id}/runtime-flags`,
            {
              service_log_id: this.serviceRunId,
              type: 'dump_pull_payload',
            }
          )
        );
      }

      if (this.storePushPayload) {
        promises.push(
          this.$axios.$post(
            `/api/api/v2/services/${this.service.id}/runtime-flags`,
            {
              service_log_id: this.serviceRunId,
              type: 'dump_push_payload',
            }
          )
        );
      }

      if (this.storeCustomScriptPayload) {
        promises.push(
          this.$axios.$post(
            `/api/api/v2/services/${this.service.id}/runtime-flags`,
            {
              service_log_id: this.serviceRunId,
              type: 'dump_custom_script_payload',
            }
          )
        );
      }

      return promises;
    },
    updateServicePayload() {
      return {
        from_options: this.combinedFromOptions,
        to_options: this.serviceToOptions,
      };
    },
    serviceRunIsFinished() {
      return ['complete', 'finished', 'failed', 'terminated'].includes(
        this.loadedServiceLog?.status
      );
    },
    showPayloadDownloadButtons() {
      return (
        (this.storePushPayload || this.storePullPayload) &&
        this.serviceRunIsFinished
      );
    },
    showCustomScriptPayloadDownloadButton() {
      return this.storeCustomScriptPayload && this.serviceRunIsFinished;
    },
    serviceHasCustomScript() {
      return !!this.service?.settings?.custom_script_id;
    },
    showCustomScripts() {
      return this.plans?.some((plan) =>
        [plans.PROFESSIONAL, plans.ENTERPRISE].includes(plan.name)
      );
    },
  },
  methods: {
    ...mapActions(useUiStore, ['openModal']),
    shouldShowDownloadPayloadButton(buttonIsActivated) {
      return buttonIsActivated && this.serviceRunIsFinished;
    },
    getTooltipMessage(type, direction = null) {
      switch (type) {
        case 'custom-script':
          if (direction === 'pull') {
            return !this.showCustomScriptPayloadDownloadButton
              ? 'Select Store Custom Script Input Payload before running to enable this feature'
              : undefined;
          }
          return !this.showCustomScriptPayloadDownloadButton
            ? 'Select Store Custom Script Output Payload before running to enable this feature'
            : undefined;
        case 'payload':
          if (direction === 'pull') {
            return !this.showPayloadDownloadButtons
              ? 'Select Store Pull Payload before running to enable this feature'
              : undefined;
          }
          return !this.showPayloadDownloadButtons
            ? 'Select Store Push Payload before running to enable this feature'
            : undefined;
        default:
          return undefined;
      }
    },
    setDefaultServiceOptionValues() {
      this.serviceFilters = this.service.filters;
      this.advancedServiceFilters = this.service.from_options.filters;
      this.serviceFromOptions = this.service.from_options;
      if (!this.serviceFromOptions) {
        this.serviceFromOptions = {};
      }

      if (!this.serviceFromOptions.page_size) {
        this.serviceFromOptions.page_size = 50;
      }
      if (!this.serviceFromOptions.timezone) {
        this.serviceFromOptions.timezone = this.defaultTimeZone;
      }
      this.serviceToOptions = this.service.to_options;
      if (!this.serviceToOptions) {
        this.serviceToOptions = {};
      }

      if (!this.serviceToOptions.timezone) {
        this.serviceToOptions.timezone = this.defaultTimeZone;
      }
    },
    runServiceConfirm() {
      this.openModal('runServiceConfirmation');
    },
    saveServiceConfirm() {
      this.openModal('saveServiceConfirmation');
    },
    async runService() {
      try {
        this.makingRequest = true;
        this.serviceRunId = await this.$axios
          .$post(
            `/api/api/v2/services/${this.service.id}/scheduled-runs`,
            this.serviceRunPayload
          )
          .then((r) => r.data.id);
        await Promise.all(this.runtimeFlagPromises);
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully scheduled the service run.',
          },
          4000
        );
      } catch (error) {
        console.log(error);

        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: 'Sorry, there was a problem scheduling the service run.',
          },
          4000
        );

        this.makingRequest = false;
      }
    },
    async updateService() {
      try {
        this.makingRequest = true;
        await this.$axios.$patch(
          `/api/api/v2/services/${this.service.id}`,
          this.updateServicePayload
        );
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully updated the service with settings.',
          },
          4000
        );
      } catch (error) {
        console.log(error);

        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: 'Sorry, there was a problem updating the service.',
          },
          4000
        );
        this.makingRequest = false;
      }
    },
    async downloadPayload(direction, payloadType) {
      try {
        const response = await this.$axios.$get(
          `/api/api/v2/service-logs/${this.serviceRunId}/payloads`,
          {
            responseType: 'blob',
            params: {
              direction,
              payload_type: payloadType,
            },
          }
        );
        const fileURL = window.URL.createObjectURL(new Blob([response]));
        const fileLink = document.createElement('a');

        fileLink.href = fileURL;
        fileLink.setAttribute('download', `${direction}-payloads.zip`);
        document.body.appendChild(fileLink);
        fileLink.click();
      } catch (error) {
        console.log(error);

        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: 'No file available please check the service logs.',
          },
          4000
        );
      }
    },
    async cancelService(stopRunOnly) {
      try {
        this.makingRequest = true;

        stopRunOnly
          ? await stopService(this.$axios, this.service.id, this.serviceRunId)
          : await stopService(this.$axios, this.service.id);

        this.makingRequest = false;
      } catch (error) {
        console.log(error);

        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: 'Sorry, there was a problem sending the flag to stop this service.',
          },
          4000
        );
        this.makingRequest = false;
      }
    },
    setLoadedServiceLog(serviceLog) {
      this.loadedServiceLog = serviceLog;
    },
    toggleAdvancedEditor() {
      this.useAdvancedFilterEditor = !this.useAdvancedFilterEditor;
    },
  },
};
</script>
