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
  name: 'TransactionPerServiceGraph',
  props: {
    transactions: {
      type: Array,
      default: () => [],
    },
    dates: {
      type: Array,
      default: () => [],
    },
    dateRange: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      legendStatus: [],
      filteredTransactions: [],
    };
  },
  computed: {
    series() {
      const allData = collect(this.transactions)
        .unique('service_id')
        .map((service) => ({
          name: service.description,
          data: this.dateRange.map((date) =>
            collect(this.transactions)
              .where('date', date)
              .where('service_id', service.service_id)
              .sum('total_transactions')
          ),
        }))
        .all();
      this.loadUpdatedTransactions();
      return allData;
    },
    chartHeight() {
      if (this.transactions?.length) {
        return 500;
      } else {
        return 450;
      }
    },
    options() {
      return {
        chart: {
          type: 'bar',
          id: 'transactionPerServiceGraph',
          stacked: true,
          toolbar: {
            show: false,
          },
          events: {
            legendClick: (chartContext, seriesIndex, config) => {
              this.legendClicked(seriesIndex);
            },
          },
        },
        plotOptions: {
          bar: {
            columnWidth: '10%',
            borderRadius: 0,
          },
        },
        title: {
          text: 'Daily transactions by service',
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
          showForSingleSeries: !!this.transactions?.length,
          height: 80,
          offsetY: 0,
          position: 'bottom',
          itemMargin: {
            horizontal: 15,
            vertical: 0,
          },
        },
        dataLabels: {
          enabled: false,
        },
        colors: ['#0c80e5', '#3cceff', '#4be6ad', '#6e44ff', '#ffd430'],
        labels: this.dateRange,
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
    loadUpdatedTransactions() {
      this.filteredTransactions = this.transactions.map((transaction) => ({
        ...transaction,
        status: true,
      }));
      this.$emit('legendStatusUpdated', this.filteredTransactions);
    },
    legendClicked(seriesIndex) {
      const changedSerieName = this.legendStatus[seriesIndex].name;
      this.filteredTransactions.map((transaction) => {
        if (transaction.description === changedSerieName) {
          transaction.status = !transaction.status;
        }
        return transaction;
      });
      this.$emit('legendStatusUpdated', this.filteredTransactions);
    },
  },
};
</script>
