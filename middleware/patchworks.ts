export default defineNuxtRouteMiddleware(async (to, from) => {
  const { $patchworks } = useNuxtApp();

  if (!$patchworks()) {
    return abortNavigation();
  }
});
