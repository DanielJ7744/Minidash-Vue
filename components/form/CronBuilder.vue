<template>
  <div class="space-y-5">
    <!-- Presets -->
    <FormElement
      title="preset"
      label="Preset"
      v-model="selectedPreset"
      v-slot="{ inputProps, inputEvents }"
    >
      <select v-bind="inputProps" v-on="inputEvents">
        <option value="">-</option>
        <option v-for="preset in presets" :value="preset.value">
          {{ preset.label }}
        </option>
      </select>
    </FormElement>

    <template v-if="$can('cron editor')">
      <!-- Advanced toggle -->
      <div class="flex items-center">
        <div class="flex h-5 items-center">
          <input
            id="advanced_editor"
            name="advanced_editor"
            type="checkbox"
            v-model="advanced"
          />
        </div>
        <div class="ml-2">
          <label for="advanced_editor" class="text-gray-700"> Advanced </label>
        </div>
      </div>

      <div class="space-y-5 rounded bg-gray-50 p-3">
        <FormElement
          title="expression"
          label="Expression"
          :modelValue="modelValue"
          @update:modelValue="handleExpressionUpdate"
          v-slot="{ inputProps, inputEvents }"
          :disabled="!advanced"
        >
          <input
            type="text"
            v-bind="inputProps"
            v-on="inputEvents"
            ref="expressionInput"
          />
        </FormElement>
      </div>

      <div class="space-y-5 rounded bg-gray-50 p-3">
        <div class="flex space-x-3">
          <FormElement
            class="flex-1"
            v-model="minutes"
            title="minute"
            label="Minutes"
            :disabled="advanced"
            v-slot="{ inputProps, inputEvents }"
          >
            <input
              type="text"
              v-bind="inputProps"
              v-on="inputEvents"
              ref="minutesInput"
            />
          </FormElement>

          <FormElement
            class="flex-1"
            v-model="hours"
            title="hour"
            label="Hours"
            :disabled="advanced"
            v-slot="{ inputProps, inputEvents }"
          >
            <input type="text" v-bind="inputProps" v-on="inputEvents" />
          </FormElement>
        </div>

        <div>
          <div class="flex space-x-3">
            <FormElement
              class="flex-1"
              v-model="daysOfTheMonth"
              title="days_of_the_month"
              label="Days"
              :disabled="advanced"
              v-slot="{ inputProps, inputEvents }"
            >
              <input type="text" v-bind="inputProps" v-on="inputEvents" />
            </FormElement>
            <div class="w-full flex-1 shrink-0"></div>
          </div>
        </div>

        <!-- Months -->
        <div class="space-y-2">
          <label for="Months">Months</label>

          <div
            class="xs:grid-cols-3 grid grid-cols-2 gap-y-3 sm:grid-cols-6 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
          >
            <div
              class="flex items-center"
              v-for="(month, idx) in [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ]"
            >
              <div class="flex h-5 items-center">
                <input
                  :id="`months-${month.toLowerCase()}`"
                  name="months"
                  type="checkbox"
                  :disabled="advanced"
                  v-model.number="months"
                  :value="idx + 1"
                />
              </div>
              <div class="ml-2">
                <label
                  :for="`months-${month.toLowerCase()}`"
                  class="font-normal text-gray-700"
                  :class="{
                    'text-gray-400': advanced,
                  }"
                >
                  {{ month }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Day of Week -->
        <div class="space-y-2">
          <label for="Months">Day of Week</label>

          <div
            class="xs:grid-cols-3 grid grid-cols-2 gap-y-3 sm:grid-cols-6 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
          >
            <div
              class="flex items-center"
              v-for="dayOfWeek in [
                { label: 'Monday', value: 1 },
                { label: 'Tuesday', value: 2 },
                { label: 'Wednesday', value: 3 },
                { label: 'Thursday', value: 4 },
                { label: 'Friday', value: 5 },
                { label: 'Saturday', value: 6 },
                { label: 'Sunday', value: 0 },
              ]"
            >
              <div class="flex h-5 items-center">
                <input
                  :id="`days-of-the-week-${dayOfWeek.label.toLowerCase()}`"
                  name="days-of-the-week"
                  type="checkbox"
                  :disabled="advanced"
                  v-model.number="daysOfTheWeek"
                  :value="dayOfWeek.value"
                />
              </div>
              <div class="ml-2">
                <label
                  :for="`days-of-the-week-${dayOfWeek.label.toLowerCase()}`"
                  class="font-normal text-gray-700"
                  :class="{
                    'text-gray-400': advanced,
                  }"
                >
                  {{ dayOfWeek.label }}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import parser from 'cron-parser';
import { isValidCron } from 'cron-validator';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const presets = [
  { label: 'Every 10 minutes', value: '*/10 * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Every 30 minutes', value: '*/30 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every 2 hours', value: '0 */2 * * *' },
];

const advanced = shallowRef(false);
const selectedPreset = shallowRef<string | undefined>(undefined);

const minutes = ref('*');
const hours = ref('*');
const daysOfTheMonth = ref('*');
const months = ref<number[]>([]);
const daysOfTheWeek = ref<number[]>([]);

const expressionInput = ref<HTMLInputElement | null>(null);
const minutesInput = ref<HTMLInputElement | null>(null);

const findCronExpressionInPresets = (value: string) =>
  presets.find((preset) => preset.value === value);

const matchedExpressionPreset = findCronExpressionInPresets(props.modelValue);

if (matchedExpressionPreset) {
  selectedPreset.value = matchedExpressionPreset.value;
}

watch(
  () => selectedPreset.value,
  (preset) => {
    if (preset) {
      emit('update:modelValue', preset);
      setFormValuesFromExpression(preset);
    }
  }
);

watch(
  () => advanced.value,
  (advanceSelected) => {
    nextTick(() => {
      advanceSelected
        ? expressionInput.value?.focus()
        : minutesInput.value?.focus();
    });
  }
);

const setFormValuesFromExpression = (value: string) => {
  const parsed = parser.parseExpression(value);
  const [splitMinutes, splitHours, splitDaysOfTheMonth] = value.split(' ');

  minutes.value = splitMinutes;
  hours.value = splitHours;
  daysOfTheMonth.value = splitDaysOfTheMonth;
  months.value = parsed.fields.month as number[];
  daysOfTheWeek.value = parsed.fields.dayOfWeek as number[];
};

const warnCronIsInvalid = (value: string) => {
  if (!isValidCron(value)) {
    console.log('[cron] Invalid expression: ', value);
  }
};

const parseMonths = (value: number[]): string => {
  value = [...value].sort(function (a, b) {
    return a - b;
  });

  const isAllMonths = Array.from({ length: 12 }, (_, i) => i + 1).every(
    (month) => value.includes(month)
  );

  return isAllMonths ? '*' : value.join(',');
};

const parseDaysOfTheWeek = (value: number[]): string => {
  // 0 + 7 both represent sunday, we use 0 for the UI
  if (value.includes(0) || value.includes(7)) {
    value = value.filter((day) => ![0, 7].includes(day));
    value.push(0);
  }

  value = [...value].sort(function (a, b) {
    return a - b;
  });

  const isAllDays = [...Array(6).keys()].every((day) => value.includes(day));

  return isAllDays ? '*' : value.join(',');
};

const handleExpressionUpdate = (value: string) => {
  if (!isValidCron(value)) {
    warnCronIsInvalid(value);
    return;
  }

  setFormValuesFromExpression(value);
  emit('update:modelValue', value);
};

setFormValuesFromExpression(props.modelValue);

watch(
  () => [
    minutes.value,
    hours.value,
    daysOfTheMonth.value,
    months.value,
    daysOfTheWeek.value,
  ],
  () => {
    if (advanced.value) {
      return;
    }

    const parsedMonths = parseMonths(months.value);
    const parsedDaysOfTheWeek = parseDaysOfTheWeek(daysOfTheWeek.value);

    const newExpression = `${minutes.value} ${hours.value} ${daysOfTheMonth.value} ${parsedMonths} ${parsedDaysOfTheWeek}`;

    if (!isValidCron(newExpression)) {
      warnCronIsInvalid(newExpression);
      return;
    }

    emit('update:modelValue', newExpression);
  }
);
</script>
