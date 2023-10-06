import { plansWithCustomScripting } from '@/lib/customScripting';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { $subscribedAny } = useNuxtApp();

  if (!$subscribedAny(plansWithCustomScripting)) {
    return abortNavigation();
  }
});
