<template>
  <div>
    <Breadcrumb current-page="Home" />

    <div class="space-y-12">
      <PageHeader>
        <template #title>{{ greeting }}</template>
        <template #description>
          <p>Here's what's happening with your integrations today.</p>
        </template>
        <template #actions>
          <span
            class="xs:my-0 xs:mb-0 xs:order-2 order-1 my-3 rounded-sm border border-orange-300 bg-orange-100 p-1 text-xs text-orange-500"
          >
            {{ primarySubscription.name }}
          </span>
        </template>
      </PageHeader>

      <div>
        <div
          class="xs:grid-cols-4 grid grid-cols-2 gap-px overflow-hidden rounded border bg-gray-200"
        >
          <PageIndexStatistic
            :loading="$fetchState.pending"
            title="Total transactions"
            :total="totalTransactionToday"
            total-only
          />
          <PageIndexStatistic
            :loading="$fetchState.pending"
            title="Failed transactions"
            :total="todaysFailedTransactions"
            :colour="todaysFailedTransactions ? '#E03F29' : undefined"
            total-only
          />
          <PageIndexStatistic
            :total="usage?.active_services || 0"
            :progress="usage?.active_services"
            :subscription="primarySubscription.name"
            title="Total services"
          />
          <PageIndexStatistic
            :total="usage?.transaction_count || 0"
            :progress="usage?.transaction_count || 0"
            :subscription="primarySubscription.name"
            title="Monthly transactions"
          />
        </div>

        <div
          class="my-1.5 flex items-center justify-end space-x-1 text-gray-400"
        >
          <p class="text-xs font-normal">Refreshed hourly</p>
          <Icon name="la:redo-alt" />
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-x-5 md:gap-y-5 lg:flex-nowrap">
      <LazyChartTransactionsHourly
        :loading="$fetchState.pending"
        class="w-full md:w-3/6 md:flex-1"
        :transactions="formattedTransactions"
        :hours="hours"
        :hours-all="hoursAll"
      />

      <LazyChartTransactionsPerServiceHourly
        :loading="$fetchState.pending"
        class="w-full md:w-3/6 md:flex-1"
        :transactions="formattedTransactions"
        :hours="hours"
        :hours-all="hoursAll"
      />
    </div>

    <div>
      <h4 class="h4 mt-12 mb-6">Connectors</h4>
      <CarouselConnectors />
    </div>

    <div>
      <h4 class="h4 mt-12 mb-6">Unresolved Syncs</h4>
      <UiCard class="pt-6" wide>
        <EntitiesTable :initial-filters="{ days: 1, status: 'failed' }" />

        <template #footer>
          <NuxtLink
            tag="button"
            to="/client/sync-reports"
            class="button button-secondary"
          >
            View all Syncs
          </NuxtLink>
        </template>
      </UiCard>
    </div>
  </div>
</template>

<script>
import collect from 'collect.js';
import { mapState } from 'pinia';

export default defineNuxtComponent({
  name: 'Home',
  data() {
    return {
      transactions: [],
    };
  },
  async fetch() {
    const { data: transactions } = await useFabric('/api/v2/transactions', {
      params: {
        format: 'hourly',
        start: dayjs().tz(dayjs.tz.guess()).subtract(24, 'hour').format(),
        end: dayjs().tz(dayjs.tz.guess()).add(24, 'hour').format(),
      },
    });

    this.transactions = transactions;
  },

  computed: {
    ...mapState(useSubscriptionStore, ['usage', 'primarySubscription']),
    formattedTransactions() {
      const myTimezoneTime = dayjs().format('YYYY-MM-DDTHH:mm:ss');
      const utcTimezoneTime = dayjs().utc().format('YYYY-MM-DDTHH:mm:ss');
      const timeDifference =
        (dayjs(myTimezoneTime).unix() - dayjs(utcTimezoneTime).unix()) / 3600;

      return this.transactions.map((transaction) => {
        if (timeDifference > 0) {
          transaction.date = dayjs(transaction.date)
            .add(timeDifference, 'hour')
            .format('YYYY-MM-DDTHH:mm:ss');
        } else {
          transaction.date = dayjs(transaction.date)
            .subtract(Math.abs(timeDifference), 'hour')
            .format('YYYY-MM-DDTHH:mm:ss');
        }
        return transaction;
      });
    },
    todaysFailedTransactions() {
      return this.transactions.filter((t) => t.status === 'Failed').length || 0;
    },
    hoursAll() {
      const todayFirstHour = dayjs().format('YYYY-MM-DD') + 'T00:00:00';
      const hoursAllArray = [todayFirstHour];
      for (let i = 1; i < 24; i++) {
        hoursAllArray.push(
          dayjs(todayFirstHour).add(i, 'hour').format('YYYY-MM-DDTHH:mm:ss')
        );
      }
      return hoursAllArray;
    },

    hours() {
      return collect(this.formattedTransactions)
        .map((count) => count.date)
        .unique()
        .sort((a, b) => dayjs(a) - dayjs(b))
        .all();
    },
    totalTransactionToday() {
      return this.transactions.length
        ? collect(this.transactions).sum('total_transactions')
        : 0;
    },
    greeting() {
      const hourOfDay = new Date().getHours();

      let greeting = '';

      if (hourOfDay < 12) {
        greeting = 'Good morning';
      } else if (hourOfDay < 17) {
        greeting = 'Good afternoon';
      } else {
        greeting = 'Good evening';
      }

      return `${greeting}, ${this.$auth.user?.name.split(' ')[0]}`;
    },
  },
});
</script>
