<template>
  <div
    class="relative z-50 v-calendar__custom"
    :class="{ 'mb-3': applyBottomMargin }"
    v-on-click-outside="() => (showDateSelector = false)"
  >
    <div>
      <div class="flex items-center justify-end gap-2 text-sm">
        <p class="m-0 text-gray-800">{{ pickerText }}</p>

        <button
          class="button button-secondary button-lg"
          @click="showDateSelector = !showDateSelector"
        >
          <span>{{ filteredStart }}</span>
          <span class="icon icon--calendar" />
        </button>
      </div>

      <UiCard
        class="absolute right-0 top-11"
        :class="{ 'hidden': !showDateSelector }"
      >
        <select
          v-model="currentFormattedDate"
          class="w-full"
          @change="handleChange($event)"
        >
          <option
            v-for="(date, idx) in yearRangeList"
            :key="idx"
            :value="date.value"
          >
            {{ date.label }}
          </option>
        </select>
        <div
          class="flex items-center justify-between py-5 mt-5 border-t border-solid border-gray-200"
        >
          <div>
            <label for="start-date" class="mb-2">Starting</label>
            <input v-model="startDate" name="start-date" type="date" disabled />
          </div>
          <div>
            <label for="end-date" class="mb-2">Ending</label>
            <input v-model="endDate" name="end-date" type="date" disabled />
          </div>
        </div>
        <VDatePicker
          ref="datepicker"
          v-model="dateRange"
          is-range
          @drag="rangeSelected"
          :min-date='subtractXMonths(6)'
          :max-date='new Date(Date.now() + 1)'
        />
        <div
          class="flex items-center justify-between pt-5 mt-5 border-t border-solid border-gray-200"
        >
          <button
            class="button button-secondary"
            @click="cancelDateRange()"
          >
            Cancel
          </button>
          <button class="button button-primary" @click="applyDateRange()">
            Apply
          </button>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DatePicker',
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    pickerText: {
      type: String,
      required: false,
      default: 'By date'
    },
    applyBottomMargin: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      startDate: '',
      endDate: '',
      dateRange: '',
      showDateSelector: false,
      monthSelected: this.currentFormattedDate,
    };
  },
  computed: {
    filteredStart() {
      return dayjs(this.modelValue[0]).format('MMMM YYYY');
    },
    currentFormattedDate() {
      let currentDate = new Date();
      let date = dayjs(currentDate).format('YYYY-MM-01')
      return date
    },
    yearRangeList() {
      const startingDate = this.subtractXMonths(6)

      let createdDate = new Date(startingDate);
      createdDate.setDate(1);
      let currentDate = new Date();
      let dateSelect = [{
        label: createdDate.toLocaleString('en', { month: 'long', year: 'numeric' }),
        value: this.formatDate(createdDate)
      }]

      while (createdDate.setMonth(createdDate.getMonth() + 1) < currentDate) {
          dateSelect.unshift({
            label: createdDate.toLocaleString('en', { month: 'long', year: 'numeric' }),
            value: this.formatDate(createdDate)
          });
      }

      const dateArr = dayjs.months().map((month, idx) => ({
        label: dayjs().month(idx).format('MMMM YYYY'),
        value: this.formatDate(dayjs().month(idx)),
      }));

      return dateSelect
    }
  },
  watch: {
    startDate: {
      handler() {
        this.moveToDate(this.startDate);
      },
    },
    endDate: {
      handler() {
        this.moveToDate(this.endDate);
      },
    },
  },
  mounted() {
    this.setInitial();
  },
  methods: {
    rangeSelected(range) {
      this.startDate = this.formatDate(range.start);
      this.endDate = this.formatDate(range.end);
    },
    restrictedDateRange() {
        return {
          to: new Date(Date.now() + 4000), 
          from: new Date(Date.now() - 4000) 
        }
    },
    formatDate(date) {
      return dayjs(date).format('YYYY-MM-DD');
    },
    subtractXMonths(amount) {
      let currentDate = new Date();
      return currentDate.setMonth(currentDate.getMonth() - amount);
    },
    handleChange(event) {
      const selectedDate = this.setSelectedMonth(event.target.value);
      const selectedDay = dayjs(selectedDate).format('D');
      const daysInMonth = dayjs(selectedDate).daysInMonth();
      this.startDate = dayjs(selectedDate)
        .subtract(parseInt(selectedDay) - 1, 'day')
        .format('YYYY-MM-DD');
      this.endDate = dayjs(this.startDate)
        .add(parseInt(daysInMonth) - 1, 'day')
        .format('YYYY-MM-DD');
      this.moveToDate(event.target.value);
      this.dateRange = {
        start: this.formatDate(this.startDate),
        end: this.formatDate(this.endDate),
      };
    },
    moveToDate(dateToMove) {
      this.$refs.datepicker?.move(dateToMove);
    },
    setSelectedMonth(date) {
      return this.formatDate(
        dayjs().month(parseInt(dayjs(date).format('M')) - 1)
      );
    },
    applyDateRange() {
      this.showDateSelector = false;
      this.$emit('update:modelValue', [this.startDate, this.endDate]);
      this.monthSelected = this.setSelectedMonth(this.startDate);
    },
    cancelDateRange() {
      this.showDateSelector = false;
      this.setInitial();
      this.monthSelected = this.setSelectedMonth(this.modelValue[0]);
    },
    setInitial() {
      const [startDate, endDate] = this.modelValue;
      this.dateRange = {
        start: this.formatDate(startDate),
        end: this.formatDate(endDate),
      };
      this.startDate = startDate;
      this.endDate = endDate;
    },
  },
};
</script>
