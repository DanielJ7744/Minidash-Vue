<template>
  <div>
    <label v-if="showLabel">Date Format</label>
    <select
      :modelValue="modelValue"
      class="w-full bg-white content--full-width"
      @update:modelValue="emitDateFormat($event.target.value)"
    >
      <option
        v-for="(phpFormat, jsDateTimeFormat) in dateTimeFormats"
        :key="jsDateTimeFormat"
        :value="phpFormat"
      >
        <div v-if="phpFormat === 'U'">
          {{ Math.floor(Date.now() / 1000) }} | {{ phpFormat }}
        </div>
        <div v-else>
          {{
            $filters.dateTime(Date.now(), {
              formatString: jsDateTimeFormat,
            })
          }}
          |
          {{ phpFormat }}
        </div>
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'DateFormat',
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    showLabel: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      dateTimeFormats: {
        '': 'U',
        'YYYY-MM-DD hh:mm:ss': 'Y-m-d H:i:s',
        'YYYY-MM-DDThh:mm:ssZ (ISO 8601)': 'c',
        'DD MM YYYY': 'd m Y',
        'DD MM YYYY h:mm': 'd m Y g:i',
        'DD MM YYYY h:mm a': 'd m Y g:i a',
        'DD MM YYYY h:mm:ss': 'd m Y g:i:s',
        'DD MM YYYY h:mm:ss a': 'd m Y g:i:s a',
        'DD/MM/YYYY': 'd/m/Y',
        'DD/MM/YYYY h:mm': 'd/m/Y g:i',
        'DD/MM/YYYY h:mm a': 'd/m/Y g:i a',
        'DD/MM/YYYY h:mm:ss': 'd/m/Y g:i:s',
        'DD/MM/YYYY h:mm:ss a': 'd/m/Y g:i:s a',
        'MM/DD/YYYY': 'm/d/Y',
        'MM/DD/YYYY h:mm': 'm/d/Y g:i',
        'MM/DD/YYYY h:mm a': 'm/d/Y g:i a',
        'MM/DD/YYYY h:mm:ss': 'm/d/Y g:i:s',
        'MM/DD/YYYY h:mm:ss a': 'm/d/Y g:i:s a',
        'D MMMM, YYYY h:mm a': 'd F Y g:i a',
        'MMMM D, YYYY h:mm a': 'F d Y g:i a',
        'YYYY-MM-DD\\Thh:mm:ss\\Z': 'Y-m-d\\TH:i:s\\Z',
      },
    };
  },
  methods: {
    emitDateFormat(value) {
      this.$emit('update:modelValue', value);
    },
  },
};
</script>
