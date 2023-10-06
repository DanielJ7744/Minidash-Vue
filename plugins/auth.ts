export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();

  nuxtApp.vueApp.config.globalProperties.$auth = authStore;
});
