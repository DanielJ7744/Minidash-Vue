<template>
  <UiCard wide>
    <div class="flex flex-col divide-y divide-gray-200">
      <div v-if="!logs.length">
        <div class="px-4 py-4">
          <p class="text-gray-500">No results found.</p>
        </div>
      </div>
      <div class="flex flex-col divide-y divide-gray-200">
        <div
          v-for="[parsedDate, entries] in Object.entries(formattedLogs)"
          :key="parsedDate"
          class="flow-root px-4 py-4 lg:px-6 lg:py-6"
        >
          <div>
            <h6 class="h6">
              {{ parsedDate }}
            </h6>
          </div>

          <div class="mt-6 mb-5 md:px-4">
            <UiFeedsTimeline :entries="entries.items">
              <template #default="{ entry }">
                <div
                  :class="getColor(entry.event.toLowerCase())"
                  class="w-full rounded border border-solid"
                >
                  <div
                    class="min-w-0 flex-1 justify-between space-y-1 sm:flex sm:space-x-4 lg:items-center lg:space-y-0"
                  >
                    <div class="space-y-3 lg:flex lg:space-x-3 lg:space-y-0">
                      <div class="p-3 text-xs md:bg-transparent">
                        <span
                          class="rounded p-1 font-medium capitalize text-gray-700"
                        >
                          {{
                            getEventType(entry.auditable_type) +
                            ' ' +
                            entry.event
                          }}
                        </span>
                      </div>
                      <p
                        class="sm:pt-x space-y-1 px-3 py-0 text-xs text-gray-700 sm:pb-3 lg:space-y-0 lg:px-0 lg:py-3"
                      >
                        <span class="block sm:inline-block">
                          by {{ entry.user ? entry.user.name : 'Unknown user' }}
                        </span>
                        <span
                          v-if="entry.ip_address"
                          class="block sm:inline-block"
                        >
                          &nbsp;| IP: {{ entry.ip_address }}
                        </span>
                      </p>
                    </div>
                    <div
                      class="flex flex-row-reverse items-center justify-end gap-2 p-3 md:flex-row"
                    >
                      <div
                        class="whitespace-nowrap text-right text-xs text-gray-500"
                      >
                        <time :datetime="entry.created_at"
                          >{{ time(entry.created_at, { tz: true }) }}
                        </time>
                      </div>
                    </div>
                  </div>

                  <UiDataList
                    class="bg-gray-50 p-3"
                    :items="entry.dataList"
                    reveal
                  />
                </div>
              </template>
            </UiFeedsTimeline>
          </div>
        </div>
      </div>
    </div>
  </UiCard>
</template>

<script>
import collect from 'collect.js';

export default {
  name: 'AuditLogs',
  props: {
    logs: {
      type: Array,
      required: true,
    },
  },
  computed: {
    formattedLogs() {
      const collectedLogs = collect(
        this.logs
          .map((log) => this.addSummary(log))
          .map((log) => this.formatDataList(log))
      )
        .groupBy((log) => date(log.created_at, 'MMM dd, u'))
        .all();
      return collectedLogs;
    },
  },
  methods: {
    formatDataList(log) {
      log =
        log.action === 'service_scheduled_manually'
          ? { ...log, dataList: [{ label: 'Service', value: log.value }] }
          : log;
      if (log) {
        log = {
          ...log,
          dataList: Object.entries(log).map(([key, value]) => ({
            label: key.replace('_', ' '),
            value: log.old_values?.[key]
              ? `${log.old_values?.[key]} => ${value}`
              : value,
          })),
        };
      }
      return log;
    },
    addSummary(log) {
      const summaries = {
        login: (log) =>
          log.successful
            ? `${log.user.email} logged in`
            : `${log.user.email} attempted to login`,
        logout: (log) => `${log.user.email} logged out`,
        created_user: (log) =>
          log.user ? `${log.user.email} added a new user` : 'New user added',
        updated_user: (log) =>
          log.user.email === log.model.email
            ? `${log.user.email} updated their details`
            : `${log.user.email} updated a user's details`,
        deleted_user: (log) =>
          `${log.user.email} deleted ${log.old_values.email}`,
        password_reset: (log) =>
          log.successful
            ? `${log.user?.email} reset their password`
            : `${log.value} attempted to reset their password`,
        password_updated: (log) =>
          log.successful
            ? `${log.user.email} updated their password`
            : `${log.user.email} attempted to update their password`,
        password_reset_requested: (log) =>
          `${log.user.email} requested a password reset`,
        service_scheduled_manually: (log) =>
          log.successful
            ? `${log.user.email} scheduled a service manually`
            : `${log.user.email} attempted to schedule a service manually`,
      };

      try {
        return {
          ...log,
          summary: summaries[log.action]
            ? summaries[log.action](log)
            : this.defaultSummary(log),
        };
      } catch (error) {
        return { ...log, summary: this.defaultSummary(log) };
      }
    },
    defaultSummary(log) {
      return `${log.event} (id: ${log?.auditable_id ?? 'unknown_id'})`;
    },
    dateToDisplay(date) {
      return dayjs(date).format('DD-MM-YYYY : HH-MM-ss');
    },
    getColor(event) {
      let colorClass = '';
      switch (event) {
        case 'updated':
          colorClass = 'bg-orange-100';
          break;
        case 'created':
          colorClass = 'bg-green-100';
          break;
        case 'deleted':
          colorClass = 'bg-red-100';
          break;
      }
      return colorClass;
    },
    getDataList(log) {
      log = {
        ...log,
        dataList: Object.entries(log.new_values).map(([key, value]) => ({
          label: key.replace('_', ' '),
          value: log.old_values[key]
            ? `${log.old_values[key]} => ${value}`
            : value,
        })),
      };
      return log;
    },
    getEventType(auditableType) {
      const type = auditableType.split('\\').slice(-1);
      return type;
    },
  },
};
</script>
