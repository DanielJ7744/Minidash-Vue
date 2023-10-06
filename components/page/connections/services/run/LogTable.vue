<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <div v-else>
    <div
      class="mb-2 flex items-center justify-end"
      v-tooltip.top="autoRefreshTooltipMessage"
    >
      <button
        type="button"
        class="button button-secondary"
        :disabled="serviceRunHasStopped"
        @click="toggleAutoServiceLogRefresh"
      >
        <span
          class="icon"
          :class="{
            'icon--spinner4': autoRefreshServiceLogs,
            'icon--cancel-circle': !autoRefreshServiceLogs,
          }"
        />
        <span>
          Auto-refresh is {{ autoRefreshServiceLogs ? 'on' : 'off' }}
        </span>
      </button>
    </div>
    <UiDataList class="bg-gray-50 p-3" :items="logInformation" />
    <template v-if="$canViewDetailedLogs()">
      <div v-if="detailedLogEntries && detailedLogEntries.length > 0">
        <hr />
        <div class="h6">Server logs</div>
        <div
          class="grid grid-cols-4 items-center border-b bg-gray-50 p-1 pt-5 font-medium"
        >
          <div>Type</div>
          <div>Date ({{ shortTimezone() }})</div>
          <div class="col-span-2">Message</div>
        </div>
        <div class="max-h-80 overflow-y-auto bg-gray-50 px-3 text-sm">
          <div
            v-for="(detailedLogEntry, index) in detailedLogEntries"
            :key="index + detailedLogEntry.date_time"
            class="grid grid-cols-4 items-center border-b p-1"
          >
            <div
              :class="
                getLogLevelClass(detailedLogEntry.level_name.toLowerCase())
              "
            >
              {{ detailedLogEntry.level_name }}
            </div>
            <div>
              {{ $filters.dateTime(detailedLogEntry.date_time) }}
            </div>
            <div class="col-span-2">
              {{ detailedLogEntry.message }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="mt-4 text-sm">
        <div>No Server Logs found</div>
      </div>
      <template v-if="serviceHasCustomScript">
        <hr />
        <div class="h6">Custom Script Logs</div>
        <PageSettingsCustomScriptsScriptLogs
          :custom-script-id="serviceLog.service.settings.custom_script_id"
          :from-date-time="serviceLog.started_at"
          :to-date-time="serviceLog.finished_at"
        />
      </template>
    </template>
  </div>
</template>

<script>
export default {
  name: 'LogTable',
  props: {
    runId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      serviceLog: null,
      detailedLogEntries: [],
      autoRefreshServiceLogs: true,
      serviceLogTimer: '',
    };
  },
  async fetch() {
    await this.fetchAllLogs();
    this.startTimer();
  },
  beforeUnmount() {
    clearInterval(this.serviceLogTimer);
  },
  computed: {
    refreshRate() {
      if (this.serviceLog && this.serviceLog.status === 'running') {
        return 5000;
      }
      return 10000;
    },
    logInformation() {
      if (!this.serviceLog) {
        return [];
      }
      return [
        { label: 'ID', value: this.serviceLog.id },
        {
          label: 'Status',
          value: this.serviceLog.status,
          class: this.getStatusClass(this.serviceLog.status),
        },
        {
          label: 'Scheduled For',
          value: this.$filters.dateTime(this.serviceLog.due_at) ?? 'Pending',
        },
        {
          label: 'Started At',
          value: this.$filters.dateTime(this.serviceLog.started_at) ?? '-',
        },
        {
          label: 'Finished At',
          value: this.$filters.dateTime(this.serviceLog.finished_at) ?? '-',
        },
        { label: 'Filters', value: this.serviceLog.filters },
      ];
    },
    serviceHasCustomScript() {
      return !!this.serviceLog.service?.settings?.custom_script_id;
    },
    serviceRunHasStopped() {
      return ['complete', 'failed'].includes(this.serviceLog?.status);
    },
    serviceRunIsComplete() {
      return (
        this.serviceRunHasStopped || this.serviceLog?.status === 'terminated'
      );
    },
    autoRefreshTooltipMessage() {
      return this.serviceRunHasStopped
        ? 'This service run has completed.'
        : undefined;
    },
  },
  beforeDestroy() {
    clearInterval(this.serviceLogTimer);
  },
  methods: {
    getStatusClass(status) {
      switch (status) {
        case 'pending':
          return 'bg-gray-200 p-1';
        case 'running':
          return 'bg-blue-200 p-1';
        case 'complete':
          return 'bg-green-400 p-1';
        case 'failed':
        case 'terminated':
          return 'bg-danger-600 p-1 text-white';
        default:
          return '';
      }
    },
    startTimer() {
      clearInterval(this.serviceLogTimer);
      this.serviceLogTimer = setInterval(async () => {
        await this.fetchAllLogs();
      }, this.refreshRate);
    },
    getLogLevelClass(logLevel) {
      switch (logLevel) {
        case 'info':
          return 'text-green-600';
        case 'debug':
          return 'text-blue-600';
        case 'warning':
          return 'text-orange-600';
        case 'error':
        case 'critical':
          return 'text-red-600';
        default:
          return 'text-black-600';
      }
    },
    toggleAutoServiceLogRefresh() {
      this.autoRefreshServiceLogs = !this.autoRefreshServiceLogs;
      if (!this.autoRefreshServiceLogs) {
        clearInterval(this.serviceLogTimer);
        return;
      }
      this.startTimer();
    },
    async fetchAllLogs() {
      const { $canViewDetailedLogs } = useNuxtApp();

      await this.fetchServiceLog();

      if ($canViewDetailedLogs()) {
        if (this.serviceLog.status !== 'pending') {
          await this.fetchDetailedLog();
        }
      }
    },
    async fetchServiceLog() {
      try {
        this.serviceLog = await this.$axios
          .$get(`/api/api/v2/service-logs/${this.runId}`, {
            params: { include: 'service.settings' },
          })
          .then((r) => r.data);
        if (this.serviceRunIsComplete) {
          this.toggleAutoServiceLogRefresh();
        }
        this.$emit('service-log-loaded', this.serviceLog);
      } catch (error) {
        console.log(error);

        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: 'Failed getting service logs.',
          },
          4000
        );
      }
    },
    async fetchDetailedLog() {
      try {
        this.detailedLogEntries = await this.$axios
          .$get(`/api/api/v2/service-logs/${this.runId}/detailed`)
          .then((r) => r.data);
      } catch (error) {
        console.log(error);

        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: 'Failed getting detailed service logs.',
          },
          4000
        );
      }
    },
  },
};
</script>
