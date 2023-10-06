<template>
  <div class="space-y-6">
    <FormElement
      v-model="form.timezone"
      title="timezone"
      label="Time zone"
      :errors="errors"
      required
      bold
      v-slot="{ inputProps, inputEvents }"
    >
      <select v-bind="inputProps" v-on="inputEvents">
        <option value="UTC">UTC</option>
        <option
          v-for="(timeZone, idx) in timeZones"
          :key="idx"
          :value="timeZone.tzCode"
        >
          {{ timeZone.label }}
        </option>
      </select>
    </FormElement>
    <FormElement
      title="date_format"
      label="Date format"
      :errors="errors"
      required
      bold
    >
      <FormDateFormat v-model="form.date_format" :show-label="false" />
    </FormElement>
  </div>
</template>

<script>
import timeZones from 'timezones-list';

export default {
  name: 'DateDetails',
  props: {
    initial: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    errors: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  data() {
    return {
      timeZones,
      form: {
        date_format: '',
        timezone: null,
        ...this.initial,
      },
    };
  },
  watch: {
    form: {
      handler(details) {
        this.$emit('update', details);
      },
      deep: true,
    },
  },
};
</script>
