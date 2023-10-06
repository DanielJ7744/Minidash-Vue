<template>
  <div class="relative flex-grow">
    <UiLoading v-if="loading" />
    <div :class="{ 'opacity-30': loading }">
      <ChartApexChart
        type="bar"
        :height="chartHeight"
        :options="options"
        :series="series"
      />
    </div>
  </div>
</template>

<script>
import collect from 'collect.js';

export default {
  name: 'ChartTransactionByStockr',
  props: {
    transactions: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    filteredTransactions() {
      const filteredTransactions = this.transactions;
      const entityFormatTransactions = filteredTransactions.map(transaction => {
        transaction.store_url = transaction.store_url.split('\\').slice(-1)[0];
        return transaction;
      });
      return entityFormatTransactions;
    },
    series() {
      const allData = collect(this.filteredTransactions)
        .unique('store_url')
        .map(logs => ({
          x: logs.store_url,
          y: collect(this.filteredTransactions)
            .where('store_url', logs.store_url)
            .sum('total_logs'),
        }))
        .sortByDesc('y')
        .all();
      return [{ name: 'Transactions', data: allData }];
    },
    chartHeight() {
      const seriesLength = collect(this.filteredTransactions)
        .unique('store_url')
        .all().length;
      return 200 + 30 * seriesLength;
    },
    options() {
      return {
        chart: {
          type: 'bar',
          id: 'transactionByServiceGraph',
          stacked: true,
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            columnWidth: '10%',
            borderRadius: 0,
            horizontal: true,
            distributed: true,
            dataLabels: {
              position: 'bottom',
            },
          },
        },
        title: {
          text: 'Total transactions processed by Stockr',
          margin: 25,
          style: {
            fontSize: '22px',
            fontWeight: 500,
            fontFamily: 'Lato, helvetica, arial, sans-serif',
            color: '#191919',
          },
        },
        legend: {
          show: false,
        },
        dataLabels: {
          enabled: true,
          textAnchor: 'start',
          formatter: (val, opt) => {
            return opt.w.globals.labels[opt.dataPointIndex];
          },
        },
        colors: [
          '#007AFF',
          '#33CF6A',
          '#6E44FF',
          '#FDA801',
          '#FF4C47',
          '#EE6352',
          '#FF891D',
        ],
        xaxis: {
          labels: {
            style: {
              colors: ['#191919'],
              fontSize: '11px',
              fontFamily: '"Lato", helvetica, arial, sans-serif',
              fontWeight: 500,
              cssClass: '',
            },
          },
        },
        yaxis: [
          {
            show: false,
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
          text:
            !this.loading && !this.filteredTransactions?.length
              ? 'No data to display'
              : '',
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
};
</script>
