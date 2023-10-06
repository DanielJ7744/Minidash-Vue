export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.config.globalProperties.$filters = {
    // Strings
    abbreviateUnit,
    humanCron,
    // Dates
    date,
    time,
    dateTime,
    fromNow,
  };
});
