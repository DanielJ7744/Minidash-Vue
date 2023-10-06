<template>
  <div>
    <SettingsDatePicker v-model="dateRange" />
    <div v-if="!$fetchState.error">
      <ChartTransactionCount
        :transactions="filteredTransactions"
        :dates="dates"
        :date-range="fullDates"
        :loading="$fetchState.pending"
      />
    </div>
    <div v-else>
      <div class="relative h-36">
        <UiError message="An error occurred when loading transaction counts" />
      </div>
    </div>
  </div>
</template>

<script>
import collect from 'collect.js';

export default {
  name: 'ChartMonthlyTransactions',
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      transactions: [],
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
      .then(r => r.data);
  },
  computed: {
    dates() {
      return collect(this.transactions)
        .map(count => count.date)
        .unique()
        .sort((a, b) => dayjs(a) - dayjs(b))
        .all();
    },
    filteredTransactions() {
      const transactionsUpdated = this.transactions.map(transaction => ({
        ...transaction,
        status: true,
      }));
      return transactionsUpdated.filter(
        transaction => transaction.service_id === this.service.id
      );
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
  },
  watch: {
    dateRange: '$fetch',
  },
};
</script>
