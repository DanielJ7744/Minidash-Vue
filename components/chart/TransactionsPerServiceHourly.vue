<template>
  <div class="relative min-h-[480px]">
    <UiLoading v-if="loading" />
    <div v-else :class="{ 'opacity-30': loading }">
      <LazyChartApexChart
        type="bar"
        :height="chartHeight"
        :options="options"
        :series="series"
      >
        <template #title>
          Transactions by service
          <span class="text-xs text-gray-400">({{ timezoneName }})</span>
        </template>
      </LazyChartApexChart>
    </div>
  </div>
</template>

<script>
import collect from 'collect.js';

export default {
  name: 'ChartTransactionsPerServiceHourly',
  props: {
    transactions: {
      type: Array,
      default: () => [],
    },
    hours: {
      type: Array,
      default: () => [],
    },
    hoursAll: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    timezoneName() {
      return shortTimezone();
    },
    series() {
      const groupedTransactions = collect(this.transactions)
        .unique('service_id')
        .map(service => ({
          name: service.description,
          data: this.hoursAll.map(date =>
            collect(this.transactions)
              .where('date', date)
              .where('service_id', service.service_id)
              .sum('total_transactions')
          ),
        }))
        .all();
      const groupedTransactionsWithTotal =
        this.insertTotalTransaction(groupedTransactions);
      const sortedGroupedTransactions = this.sortTransactions(
        groupedTransactionsWithTotal
      );
      const maxCount = 10;
      if (sortedGroupedTransactions.length > maxCount) {
        return this.groupSmallTransactions(sortedGroupedTransactions, maxCount);
      }
      return sortedGroupedTransactions;
    },
    chartHeight() {
      if (this.transactions?.length) {
        return 400;
      }
      return 440;
    },
    options() {
      return {
        chart: {
          type: 'bar',
          id: 'TransactionPerServiceHourly',
          stacked: true,
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            columnWidth: '90%',
            borderRadius: 0,
          },
        },
        // title: {
        //   text: `Transactions by service - ${shortTimezone()}`,
        //   margin: 25,
        //   style: {
        //     fontSize: '22px',
        //     fontWeight: 500,
        //     fontFamily: 'Lato, helvetica, arial, sans-serif',
        //     color: '#191919',
        //   },
        // },
        legend: {
          show: false,
          showForSingleSeries: !!this.transactions?.length,
          height: 80,
          offsetY: 0,
          position: 'bottom',
          horizontalAlign: 'left',
          itemMargin: {
            horizontal: 15,
            vertical: 0,
          },
        },
        dataLabels: {
          enabled: false,
        },
        colors: ['#0c80e5', '#3cceff', '#4be6ad', '#6e44ff', '#ffd430'],
        labels: this.hoursAll,
        xaxis: {
          type: 'datetime',
          tickPlacement: 'on',
          labels: {
            datetimeUTC: false,
            style: {
              colors: ['#191919'],
              fontSize: '11px',
              fontFamily: '"Lato", helvetica, arial, sans-serif',
              fontWeight: 500,
              cssClass: '',
            },
            datetimeFormatter: {
              day: 'MMM d',
            },
          },
        },
        yaxis: [
          {
            labels: {
              style: {
                colors: ['191919'],
                fontSize: '11px',
                fontFamily: '"Lato", helvetica, arial, sans-serif',
                fontWeight: 500,
                cssClass: '',
              },
              formatter: abbreviateUnit,
            },
          },
        ],
        noData: {
          text: !this.transactions?.length ? 'No data to display' : '',
          align: 'center',
          verticalAlign: 'middle',
          offsetX: 0,
          offsetY: 0,
          style: {
            color: '#000000',
            fontSize: '14px',
            fontFamily: 'Helvetica',
          },
        },
      };
    },
  },
  methods: {
    insertTotalTransaction(transactions) {
      return transactions.map(transaction => {
        const totalTransactionValue = transaction.data.reduce(
          (a, b) => a + b,
          0
        );
        transaction.totalTransaction = totalTransactionValue;
        return transaction;
      });
    },
    sortTransactions(array) {
      return array.sort((a, b) => b.totalTransaction - a.totalTransaction);
    },
    groupSmallTransactions(transactions, maxCount) {
      const newTransactions = transactions.slice(0, maxCount);
      const otherSmallTransactions = transactions.slice(
        0,
        transactions.length - maxCount
      );
      const dataOfSmallTransactions = otherSmallTransactions[0].data;
      otherSmallTransactions.forEach((transaction, index) => {
        if (index > 0) {
          for (let i = 0; i < dataOfSmallTransactions.length; ++i) {
            dataOfSmallTransactions[i] =
              dataOfSmallTransactions[i] + transaction.data[i];
          }
        }
      });
      const otherGroup = { data: dataOfSmallTransactions, name: 'Other' };
      newTransactions.push(otherGroup);
      return newTransactions;
    },
  },
};
</script>
