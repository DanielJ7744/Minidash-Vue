<template>
  <div class="relative min-h-[480px]">
    <UiLoading v-if="loading" />
    <div v-else :class="{ 'opacity-30': loading }">
      <LazyChartApexChart
        type="line"
        height="400"
        :options="options"
        :series="series"
      >
        <template #title>
          Transactions
          <span class="text-xs text-gray-400">({{ timezoneName }})</span>
        </template>
      </LazyChartApexChart>
    </div>
  </div>
</template>

<script>
import collect from 'collect.js';
export default {
  name: 'ChartTransactionsHourly',
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
      let countsPerDate = [];
      let hoursReal = this.hoursAll;
      if (!this.transactions?.length) {
        hoursReal = this.hours;
      }

      countsPerDate = hoursReal.map(date =>
        collect(this.transactions).where('date', date).sum('total_transactions')
      );

      if (this.transactions?.length) {
        const currentHour = dayjs().format('YYYY-MM-DDTHH:00:00');
        if (this.hoursAll.includes(currentHour)) {
          const currentHourPosition = this.hoursAll.indexOf(currentHour);
          countsPerDate.length = currentHourPosition;
        }
      }

      return [
        {
          name: 'Hourly transactions',
          type: 'column',
          data: countsPerDate,
        },
        {
          name: 'Total Transactions',
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
          id: 'TransactionsHourly',
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
        // title: {
        //   // text: `Transactions - ${shortTimezone()}`,
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
          showForSingleSeries: true,
        },
        colors: ['#FFD430', '#FC940E'],
        markers: {
          size: 5,
          hover: {
            size: 9,
          },
        },
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
              year: 'yyyy',
              month: 'MMM \'yy',
              day: 'dd MMM',
              hour: 'HH:mm',
            },
          },
        },
        yaxis: [
          {
            seriesName: 'Total Transactions',
            min: 0,
            forceNiceScale: true,
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
};
</script>
