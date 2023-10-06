<template>
  <div class="space-y-5 page-container-fluid page-container">
    <PageHeader>
      <template #title
        >Summary
        {{
          connector.credentials.connector_name
            ? connector.credentials.connector_name
            : integration.name
        }}</template
      >

      <template #actions v-if="!isOAuth2 && !isOAuth1">
        <div v class="sm:text-right">
          <p class="h6">Connector Status</p>
          <UiBadge
            orientation="right"
            dot
            :pulse="connectorOperational"
            :loading="connectorOperational === null"
            :severity="
              connectorOperational === null
                ? 'info'
                : connectorOperational
                ? 'success'
                : 'danger'
            "
          >
            {{ connectorOperational ? 'Ok' : 'Failed' }}
          </UiBadge>
        </div>
      </template>
    </PageHeader>

    <dl class="w-full border-y">
      <div
        class="items-center w-full my-5 space-y-4 sm:divide-x sm:flex sm:space-y-0"
      >
        <dt
          class="flex flex-col w-full space-y-3 md:space-y-6 space-between sm:w-1/2 sm:pr-4"
        >
          <div class="w-full">
            <h6 class="m-0 text-gray-500">Today's successful syncs</h6>
          </div>
          <div class="flex justify-between">
            <div>
              <UiLoading
                v-if="!successfulSyncLoaded"
                class="relative h-auto mt-4"
              />
              <div v-else>
                <p
                  v-if="successfulSyncs.data"
                  class="text-2xl text-gray-700 md:text-3xl"
                >
                  {{ successfulSyncs.meta.total }}
                </p>
              </div>
            </div>
            <div>
              <button
                class="button button-secondary button-sm"
                @click="displaySuccessful = true"
              >
                View all
              </button>
            </div>
          </div>
        </dt>
        <dt
          class="flex flex-col w-full space-y-3 md:space-y-6 space-between sm:w-1/2 sm:pl-4"
        >
          <div class="w-full">
            <h6 class="m-0 text-gray-500">Today's failed syncs</h6>
          </div>
          <div class="flex justify-between">
            <div>
              <UiLoading
                v-if="!failedSyncLoaded"
                class="relative h-auto mt-4"
              />
              <div v-else>
                <p class="text-2xl text-gray-700 md:text-3xl">
                  {{ failedSyncs.meta.total }}
                </p>
              </div>
            </div>
            <div>
              <button
                class="button button-secondary button-sm"
                @click="displaySuccessful = false"
              >
                View all
              </button>
            </div>
          </div>
        </dt>
      </div>
    </dl>
    <div class="v-calendar__custom relative">
      <div
        class="flex items-center justify-end gap-2 text-sm mt-16"
      >
        <p class="m-0 text-gray-800">By date ({{ dateToDisplay }})</p>

        <button
          class="button button-secondary button-lg"
          @click="showDateSelector = !showDateSelector"
        >
          <span class="icon icon--calendar" />
        </button>
      </div>
      <div
        class="absolute right-0 top-11 card z-10"
        :class="{ 'hidden': !showDateSelector }"
      >
        <VDatePicker
          v-model="selectedDate"
          mode="date"
          @dayclick="dayClicked"
        />
      </div>
      <div v-if="!$fetchState.error" class="mb-16">
        <div
          class="flex flex-wrap lg:flex-nowrap gap-x-5 md:gap-y-5"
        >
          <ChartTransactionsHourly
            class="w-full md:flex-1 md:w-3/6"
            :transactions="transactions"
            :hours="hours"
            :hours-all="hoursAll"
            :loading="$fetchState.pending"
          />
          <ChartTransactionsPerServiceHourly
            class="w-full md:flex-1 md:w-3/6"
            :transactions="transactions"
            :hours="hours"
            :hours-all="hoursAll"
            :loading="$fetchState.pending"
          />
        </div>
      </div>
    </div>
    <div>
      <div v-show="!displaySuccessful">
        <div
          v-show="failedSyncs.meta.total"
          style="border-bottom: 1px solid #f87171"
          class="relative px-2 py-3 mt-2 mb-4 text-red-700 bg-red-100 border border-red-400 rounded md:px-4"
          role="alert"
        >
          <div class="relative left-0 inline-block md:px-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6 mr-2 text-red-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <strong
            class="relative inline-block mt-2 font-medium text-gray-700 bottom-2"
            >There are currently {{ failedSyncs.meta.total }} unresolved
            syncs</strong
          >
        </div>
        <div class="h-auto md:p-5 md:shadow-2xl md:shadow-grey-500/50">
          <h6 class="mx-0 mt-8 mb-3 text-gray-500 md:mt-0">
            Here are your unresolved syncs
          </h6>

          <ServicesSyncsFailed
            :system-name="system.factory_name"
            @loaded="setFailed"
          />
        </div>
      </div>
      <div
        v-show="displaySuccessful"
        class="h-auto md:p-5 md:shadow-2xl md:shadow-grey-500/50"
      >
        <h6 class="mx-0 mt-8 mb-3 text-gray-500 md:mt-0">
          Here are your successful syncs
        </h6>

        <ServicesSyncsSuccessful
          :system-name="system.factory_name"
          @loaded="setSuccessful"
        />
      </div>
    </div>
  </div>
</template>

<script>
import collect from 'collect.js';
import { entitiesHelperMixin } from '@/mixins/entities-helper-mixin';
import { systemsHelperMixin } from '~/mixins/system-helper-mixin';
import { dateHelperMixin } from '@/mixins/date-helper-mixin';
import { credentialFormHelperMixin } from '@/mixins/credential-form-helper-mixin';

export default {
  name: 'IntegrationSummary',
  mixins: [
    entitiesHelperMixin,
    systemsHelperMixin,
    dateHelperMixin,
    credentialFormHelperMixin,
  ],
  props: {
    connector: {
      type: Object,
      required: true,
    },
    system: {
      type: Object,
      required: true,
    },
    integration: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    connectorOperational: null,
    displaySuccessful: false,
    failedSyncs: {
      meta: {
        total: 0,
      },
    },
    successfulSyncs: {
      meta: {
        total: 0,
      },
    },
    failedSyncLoaded: false,
    successfulSyncLoaded: false,
    liveEnvironmentIdentifiers: [
      'live',
      'production',
      'sandbox',
      'staging',
      'dev',
      'development',
      'test',
    ],
    transactions: [],
    showDateSelector: false,
    selectedDate: dayjs().tz(dayjs.tz.guess()).format('YYYY-MM-DDTHH:mm:ss'),
  }),
  async fetch() {
    try {
      this.transactions = await this.$axios
        .$get('/api/api/v2/transactions', {
          params: this.transactionRequestParams,
        })
        .then((response) => {
          const transactionsData = response.data;
          const transactionDataByUtc =
            this.updateDatesToUtcTime(transactionsData);
          return this.filterTransactions(transactionDataByUtc);
        });
    } catch (e) {
      this.$notify(
        {
          group: 'notifications',
          type: 'error',
          text: `Failed loading transactions: ${e}`,
        },
        4000
      );
    }
  },
  computed: {
    hoursAll() {
      const todayFirstHour =
        dayjs(this.selectedDate).format('YYYY-MM-DD') + 'T00:00:00';
      const hoursAllArray = [todayFirstHour];
      for (let i = 1; i < 24; i++) {
        hoursAllArray.push(
          dayjs(todayFirstHour).add(i, 'hour').format('YYYY-MM-DDTHH:mm:ss')
        );
      }
      return hoursAllArray;
    },
    timeDifferenceWithUtc() {
      const myTimezoneTime = dayjs().format('YYYY-MM-DDTHH:mm:ss');
      const utcTimezoneTime = dayjs().utc().format('YYYY-MM-DDTHH:mm:ss');
      return (
        (dayjs(myTimezoneTime).unix() - dayjs(utcTimezoneTime).unix()) / 3600
      );
    },
    hours() {
      return collect(this.transactions)
        .map((count) => count.date)
        .unique()
        .sort((a, b) => dayjs(a) - dayjs(b))
        .all();
    },
    dateToDisplay() {
      return dayjs(this.selectedDate).format('YYYY-MM-DD');
    },
    transactionRequestParams() {
      return {
        format: 'hourly',
        start: dayjs(this.selectedDate)
          .tz(dayjs.tz.guess())
          .subtract(24, 'hour')
          .format(),
        end: dayjs(this.selectedDate)
          .tz(dayjs.tz.guess())
          .add(24, 'hour')
          .format(),
      };
    },
    isOAuth1() {
      return (
        this.connector.credentials.auth_type === 'oauth1' ||
        this.connector.credentials.authorisation_type === 'oauth1'
      );
    },
    isOAuth2() {
      return (
        this.connector.credentials.auth_type === 'oauth2' ||
        this.connector.credentials.authorisation_type === 'oauth2'
      );
    },
  },
  watch: {
    selectedDate: '$fetch',
  },
  mounted() {
    if (!this.isOAuth2 && !this.isOAuth1) {
      this.checkConnectorStatus();
    }
  },
  methods: {
    checkConnectorStatus() {
      this.$axios
        .post(`/api/api/v2/check-connector-auth/${this.connector.id}`)
        .then(() => {
          this.connectorOperational = true;
        })
        .catch(() => {
          this.connectorOperational = false;
        });
    },
    updateDatesToUtcTime(transactionsData) {
      transactionsData.forEach((transaction) => {
        if (this.timeDifferenceWithUtc > 0) {
          transaction.date = dayjs(transaction.date)
            .add(this.timeDifferenceWithUtc, 'hour')
            .format('YYYY-MM-DDTHH:mm:ss');
        } else {
          transaction.date = dayjs(transaction.date)
            .subtract(Math.abs(this.timeDifferenceWithUtc), 'hour')
            .format('YYYY-MM-DDTHH:mm:ss');
        }
        return transaction;
      });
      return transactionsData;
    },
    filterTransactions(transactions) {
      return transactions.filter((transaction) => {
        const fromFactoryName = transaction.description.split(' - ')[1];
        return fromFactoryName === this.connector.system.name;
      });
    },
    setFailed(attributes) {
      this.failedSyncs = attributes;
      this.failedSyncLoaded = true;
    },
    setSuccessful(attributes) {
      this.successfulSyncs = attributes;
      this.successfulSyncLoaded = true;
    },
    dayClicked() {
      this.showDateSelector = false;
    },
  },
};
</script>
