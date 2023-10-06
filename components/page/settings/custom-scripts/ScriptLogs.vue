<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <div v-else>
    <div
      v-if="logs.length === 0"
      class="flex flex-col items-center justify-center gap-y-2 text-sm"
    >
      <div>
        There are no logs available for this custom script from the past
        {{ logsForDay ? '24 hours' : '30 minutes' }}.
      </div>
      <div>
        Please run this script or add this script to a service to generate logs.
      </div>
      <div
        v-if="!fromDateTime && !toDateTime"
        class="flex w-full justify-around"
      >
        <button
          type="button"
          class="button button-secondary button-sm"
          :disabled="isLoading"
          @click="refreshLogs"
        >
          <span
            class="icon icon--spinner4 mr-2"
            :class="{ 'animate-spin': isLoading && !loadingLogsForDay }"
          />
          Load logs for past 30 minutes
        </button>

        <button
          type="button"
          class="button button-secondary button-sm"
          :disabled="isLoading"
          @click="loadLogsForDay"
        >
          <span
            class="icon icon--spinner4 mr-2"
            :class="{ 'animate-spin': loadingLogsForDay }"
          />
          Load logs for past 24 hours
        </button>
      </div>
    </div>
    <div v-else>
      <div class="mb-2 flex justify-end">
        <button
          type="button"
          class="button button-secondary button-sm"
          :disabled="isLoading"
          @click="getLogs"
        >
          <span
            class="icon icon--spinner4 mr-2"
            :class="{ 'animate-spin': isLoading }"
          />
          Refresh
        </button>
      </div>
      <UiDataList
        class="max-h-96 overflow-y-auto bg-gray-50 p-3 font-mono"
        :items="logInformation"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScriptLogs',
  props: {
    customScriptUrl: {
      type: String,
      required: false,
      default: null,
    },
    customScriptId: {
      type: Number,
      required: false,
      default: null,
    },
    fromDateTime: {
      type: String,
      required: false,
      default: null,
    },
    toDateTime: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      isLoading: false,
      logs: [],
      logsForDay: false,
      loadingLogsForDay: false,
      scriptUrl: null,
    };
  },
  async fetch() {
    if (this.customScriptUrl) {
      this.scriptUrl = this.customScriptUrl;
    }

    if (this.customScriptId) {
      const customScript = await this.$axios
        .$get(
          `/api/api/v1/transform-scripts/company/${this.$auth.user.company_id}/custom_scripts/${this.customScriptId}`
        )
        .then((r) => r.data);
      this.scriptUrl = customScript.script_url;
    }

    await this.getLogs();
  },
  computed: {
    logQuery() {
      const query = {
        url: this.scriptUrl,
        from_time: this.fromDateTime
          ? dayjs(this.fromDateTime).toISOString()
          : dayjs().subtract(30, 'minutes').toISOString(),
      };

      if (!this.toDateTime && !this.logsForDay) {
        query.to_time = dayjs().toISOString();
      }

      if (this.toDateTime) {
        query.to_time = dayjs(this.toDateTime).toISOString();
      }

      if (this.logsForDay) {
        query.to_time = dayjs().subtract(24, 'hours').toISOString();
      }

      return query;
    },
    logInformation() {
      if (!this.logs.length) {
        return [];
      }
      return this.logs.map(function (log) {
        return { value: log.message, label: time(log.timestamp) };
      });
    },
  },
  methods: {
    async getLogs() {
      this.isLoading = true;
      try {
        this.logs = await useFabric('/api/v2/custom-script-logs', {
          params: this.logQuery,
        }).then((r) => r.data);
      } catch (error) {
        console.log(error);
        this.notify('error', 'Failed to load custom script logs.');
      } finally {
        this.isLoading = false;
      }
    },
    async refreshLogs() {
      this.logsForDay = false;
      await this.getLogs();
    },
    async loadLogsForDay() {
      this.logsForDay = true;
      this.loadingLogsForDay = true;
      try {
        await this.getLogs();
      } catch (error) {
        console.log(error);
        this.notify('error', 'Failed to load custom script logs.');
      } finally {
        this.loadingLogsForDay = false;
      }
    },
  },
};
</script>
