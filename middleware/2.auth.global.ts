export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  if (to.name === 'logout') {
    return true;
  }

  if (!authStore.check && to.meta.auth !== false) {
    if (to.name !== 'login') {
      return navigateTo({ name: 'login' });
    }
  }

  // Prevent unauthenticated user accessing authenticated routes
  if (authStore.check && to.meta.auth === false) {
    return navigateTo({ name: 'index' });
  }
});
