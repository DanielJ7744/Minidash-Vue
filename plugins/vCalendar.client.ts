import { Calendar, DatePicker } from 'v-calendar';

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp
    .component('VCalendar', Calendar)
    .component('VDatePicker', DatePicker);
});
