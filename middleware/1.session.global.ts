export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  const authToken = useCookie('authToken');

  if (to.name === 'logout') {
    return true;
  }

  if (process.server) {
    if (authToken.value && !authStore.check) {
      authStore.token = authToken.value;

      try {
        await authStore.initialise();
      } catch (e) {
        return navigateTo({ name: 'logout' });
      }
    }
  }
});
