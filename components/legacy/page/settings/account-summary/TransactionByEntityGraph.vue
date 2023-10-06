<template>
  <div class="relative mt-10">
    <ChartApexChart
      type="bar"
      :height="chartHeight"
      :options="options"
      :series="series"
    />
  </div>
</template>

<script>
import collect from 'collect.js';

export default {
  name: 'TransactionByEntityGraph',
  props: {
    transactions: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    filteredTransactions() {
      const filteredTransactions = this.transactions.filter(
        (transaction) => transaction.status
      );
      const entityFormatTransactions = filteredTransactions.map((transaction) => {
        transaction.from_factory = transaction.from_factory.split('\\').slice(-1)[0];
        return transaction;
      });
      return entityFormatTransactions;
    },
    series() {
      const allData = collect(this.filteredTransactions)
        .unique('from_factory')
        .map((service) => ({
          x: service.from_factory,
          y: collect(this.filteredTransactions)
            .where('from_factory', service.from_factory)
            .sum('total_transactions'),
        }))
        .sortByDesc('y')
        .all();
      return [{ name: 'Transactions', data: allData }];
    },
    chartHeight() {
      const seriesLength = collect(this.filteredTransactions).unique('from_factory').all()
        .length;
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
          text: 'Total transactions by entity',
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
          enabled: false,
          textAnchor: 'start',
          formatter: (val, opt) => {
            return opt.w.globals.labels[opt.dataPointIndex];
          },
        },
        colors: [
          '#007AFF',
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
            show: true,
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
          text: !this.filteredTransactions?.length ? 'No data to display' : '',
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
