<template>
  <div>
    <Breadcrumb
      current-page="Account Summary"
      :crumbs="{ Settings: '/settings' }"
    />
    <PageHeader>
      <template #title> {{ $auth.company.name }}</template>
      <template #description>
        <p>
          Welcome to your account summary, you can browse previous months using
          the date selector.
        </p>
      </template>
      <template #actions>
        <span
          class="border border-solid border-yellow-500 p-1 text-xs text-yellow-500"
        >
          {{ primarySubscription.name }}
        </span>
      </template>
    </PageHeader>

    <UiLoading v-if="$fetchState.pending" />
    <UiError
      v-if="$fetchState.error"
      message="An error occurred when loading transaction counts"
    />

    <SettingsDatePicker v-model="dateRange" />
    <div
      class="sticky top-0 z-20 flex flex-col gap-x-5 bg-white md:gap-y-5 lg:flex-row"
    >
      <div class="w-full lg:w-3/4">
        <div class="flex flex-wrap gap-x-5 md:gap-y-5">
          <LegacyPageSettingsAccountSummaryCard
            :total="allowance.services"
            :progress="usage.active_services"
            :subscription="subscriptionName"
            title="Services"
            link-text="View services"
            link="/services"
          />
          <LegacyPageSettingsAccountSummaryCard
            :total="allowance.transactions"
            :progress="usage.transaction_count"
            :subscription="subscriptionName"
            title="Transaction Total"
            link-text="Manage"
            link="/settings/billing"
          />
        </div>
      </div>
      <div class="w-full lg:w-3/12">
        <div class="card h-full flex-grow px-5 py-4 md:mb-0">
          <div class="mb-5 flex items-center justify-between">
            <h3 class="text-sm font-medium">Bolt-ons</h3>
            <NuxtLink slot="bottom" :to="{ name: 'settings-billing' }">
              <p class="text-sm text-gray-800 underline">Manage</p>
            </NuxtLink>
          </div>
          <div v-if="boltOns.length">
            <p
              v-for="boltOn in boltOns"
              :key="boltOn"
              class="m-0 text-xs leading-4 text-black"
            >
              {{ boltOn }}
            </p>
          </div>
          <div v-else>
            Your account is not currently subscribed to any bolt-ons.
          </div>
        </div>
      </div>
    </div>

    <UiCollapsibleTabs v-model="tabName" :tabs="tabs" :currentTab="tabName" />
    <template v-if="tabName === 'services'">
      <LegacyPageSettingsAccountSummaryTransactionCountGraph
        :transactions="filteredTransactions"
        :dates="dates"
        :date-range="fullDates"
      />
      <LegacyPageSettingsAccountSummaryTransactionPerServiceGraph
        :transactions="transactions"
        :dates="dates"
        :date-range="fullDates"
        @legendStatusUpdated="legendStatusUpdated"
      />
      <LegacyPageSettingsAccountSummaryTransactionByEntityGraph
        :transactions="filteredTransactions"
      />
      <LegacyPageSettingsAccountSummaryTransactionByServiceGraph
        :transactions="filteredTransactions"
      />
    </template>
    <template v-else-if="tabName === 'stockr'">
      <div v-if="boltOns.length && !$fetchState.error">
        <div class="float-left mt-10 flex w-1/4 flex-row">
          <LegacyPageSettingsAccountSummaryTotalCard
            :total="totalStockrSum"
            :totalCosting="totalStockrCosting"
            :storeData="stockrStoreLogs"
            :companyId="this.company.id"
            :startDate="this.dateRange[0]"
            :endDate="this.dateRange[1]"
            :pricePerTransaction="companySettings.price_per_transaction"
            title="Stockr Summary"
          />
        </div>
        <div class="float-left block w-3/4">
          <LegacyPageSettingsAccountSummaryTransactionByStockrGraph
            v-if="!$fetchState.pending"
            :transactions="stockrStoreLogs"
            :companySettings="companySettings"
            :stockrTotal="totalStockrSum"
            :loading="$fetchState.pending"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import collect from 'collect.js';
import { mapState } from 'pinia';

export default {
  name: 'AccountSummary',
  data() {
    return {
      tabName: 'services',
      totalStockrSum: 0,
      companySettings: [],
      stockrStoreLogs: [],
      transactions: [],
      filteredTransactions: [],
      dateRange: [
        dayjs()
          .subtract(parseInt(dayjs().format('D') - 1), 'day')
          .format('YYYY-MM-DD'),
        dayjs().add(1, 'day').format('YYYY-MM-DD'),
      ],
    };
  },
  async fetch() {
    this.transactions = await this.$axios
      .$get('/api/api/v2/transactions', {
        params: {
          start: this.dateRange[0],
          end: this.dateRange[1],
        },
      })
      .then((r) => r.data);
    if (this.boltOns.includes('Stockr')) {
      this.companySettings = await this.$axios
        .$get('/api/api/v2/my/company-settings', {})
        .then((r) => r.data);
      await this.getStockrTransactions();
    }
  },
  computed: {
    ...mapState(useSubscriptionStore, [
      'plans',
      'allowance',
      'usage',
      'primarySubscription',
    ]),
    ...mapState(useAuthStore, ['company']),
    dates() {
      return collect(this.transactions)
        .map((count) => count.date)
        .unique()
        .sort((a, b) => dayjs(a) - dayjs(b))
        .all();
    },
    totalStockrCosting() {
      const totalCosting =
        this.totalStockrSum * this.companySettings.price_per_transaction;
      return Math.round(totalCosting * 100) / 100;
    },
    subscriptionName() {
      let subscriptionName = '';
      this.plans.forEach(function (item) {
        if (item.name === 'Base') {
          subscriptionName = item.name;
        }
      });
      return subscriptionName;
    },
    fullDates() {
      const daysInMonth = dayjs(this.dateRange[0]).daysInMonth();
      const diffTime = Math.abs(
        new Date(this.dateRange[1]) - new Date(this.dateRange[0])
      );
      let totalSelectedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (totalSelectedDays < daysInMonth) {
        totalSelectedDays = daysInMonth;
      }
      const startDate = dayjs(this.dateRange[0]);
      const dateRange = [];
      for (let i = 0; i < parseInt(totalSelectedDays); i++) {
        const dateValue = dayjs(startDate).add(i, 'day').format('YYYY-MM-DD');
        dateRange.push(dateValue);
      }
      return dateRange;
    },
    boltOns() {
      return this.plans.filter((plan) => plan.upgrade).map((plan) => plan.name);
    },
    stockrBoltOn() {
      return this.boltOns.includes('Stockr');
    },
    tabs() {
      const tabs = [{ key: 'services', label: 'Services' }];
      if (this.stockrBoltOn) {
        tabs.push({ key: 'stockr', label: 'Stockr' });
      }

      return tabs;
    },
  },
  watch: {
    dateRange: '$fetch',
  },
  methods: {
    legendStatusUpdated(filteredTransactions) {
      this.filteredTransactions = filteredTransactions;
    },
    async getStockrTransactions() {
      try {
        const response = await this.$axios.$get(
          '/api/api/v1/stockr/api/v1/dashboard/logs',
          {
            params: {
              company_id: this.company.id,
              start_datetime: this.dateRange[0],
              end_datetime: this.dateRange[1],
            },
          }
        );
        this.stockrStoreLogs = response.data;
        this.totalStockrSum = response.sum_total_logs;
      } catch (error) {
        let errorMessage = JSON.stringify(error.response?.data);
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Stockr could not load data ${errorMessage}`,
          },
          6000
        );
      }
    },
  },
};
</script>
