export default defineNuxtRouteMiddleware((to) => {
  const { $can, $role } = useNuxtApp();

  if (to.meta.can && !$can(to.meta.can)) {
    return abortNavigation();
  }

  if (to.meta.role && !$role(to.meta.role)) {
    return abortNavigation();
  }
});
