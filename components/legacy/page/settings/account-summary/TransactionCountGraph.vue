<template>
  <div class="relative mt-10">
    <ChartApexChart type="line" height="450" :options="options" :series="series" />
  </div>
</template>

<script>
import collect from 'collect.js';

export default {
  name: 'TransactionCountGraph',
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
  computed: {
    filteredTransactions() {
      return this.transactions.filter((transaction) => transaction.status);
    },
    series() {
      let countsPerDate = this.dateRange.map((date) =>
        collect(this.filteredTransactions).where('date', date).sum('total_transactions')
      );
      const today = dayjs().format('YYYY-MM-DD');
      if (this.dateRange.includes(today)) {
        const todayPosition = this.dateRange.indexOf(today);
        countsPerDate.length = todayPosition + 1;
      } else if (new Date(this.dateRange[0]) - new Date(today) > 0) {
        countsPerDate = [];
      }
      return [
        {
          name: 'Daily transaction',
          type: 'column',
          data: countsPerDate,
        },
        {
          name: 'Total Transaction',
          type: 'area',
          data: countsPerDate.reduce(
            (totalsPerDate, count) => [
              ...totalsPerDate,
              (totalsPerDate.pop() || 0) + count,
            ],
            []
          ),
        },
      ];
    },
    options() {
      return {
        chart: {
          type: 'line',
          id: 'transactionCountGraph',
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        fill: {
          type: ['solid', 'gradient'],
          gradient: {
            shade: 'light',
            type: 'vertical',
            shadeIntensity: 0,
            gradientToColors: undefined,
            inverseColors: true,
            opacityFrom: 0.5,
            opacityTo: 0,
            stops: [0, 70, 100],
            colorStops: [],
          },
        },
        plotOptions: {
          bar: {
            columnWidth: '10%',
            distributed: false,
            fill: false,
          },
        },
        stroke: {
          width: [0, 3],
        },
        title: {
          text: 'Daily transactions',
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
        colors: ['#FFD430', '#FC940E'],
        markers: {
          size: 5,
          hover: {
            size: 9,
          },
        },
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
            seriesName: 'Total Transaction',
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
