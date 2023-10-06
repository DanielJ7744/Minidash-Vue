<template>
  <div class="relative">
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
  name: 'ChartTransactionByService',
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
      return this.transactions.filter(transaction => transaction.status);
    },
    series() {
      const allData = collect(this.filteredTransactions)
        .unique('service_id')
        .map(service => ({
          x: service.description,
          y: collect(this.filteredTransactions)
            .where('service_id', service.service_id)
            .sum('total_transactions'),
        }))
        .sortByDesc('y')
        .all();
      return [{ name: 'Transactions', data: allData }];
    },
    chartHeight() {
      const seriesLength = collect(this.filteredTransactions)
        .unique('service_id')
        .all().length;
      return 200 + 30 * seriesLength;
    },
    options() {
      return {
        chart: {
          type: 'bar',
          id: 'TransactionByService',
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
          text: 'Total transactions by service',
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
