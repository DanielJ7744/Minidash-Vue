import { RoleName, PermissionName } from '@/types/fabric/v2';

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();
  const subscriptionStore = useSubscriptionStore();

  const can = (
    value?: PermissionName | [PermissionName, ...PermissionName[]]
  ): boolean => {
    if (!value || !authStore.user?.permissions?.length) {
      return false;
    }

    if (Array.isArray(value)) {
      return value.every((permission) =>
        authStore.user?.permissions?.includes(permission)
      );
    }

    return authStore.user.permissions.includes(value);
  };

  const canAny = (
    value?: PermissionName | [PermissionName, ...PermissionName[]]
  ): boolean => {
    if (!value) {
      return false;
    }

    if (Array.isArray(value)) {
      return value.some((permission) => can(permission));
    }

    return can(value);
  };

  const cannot = (value?: PermissionName): boolean => {
    if (!value) {
      return false;
    }

    return !can(value);
  };

  const role = (value?: RoleName | [RoleName, ...RoleName[]]): boolean => {
    if (!value || !authStore.user?.roles?.length) {
      return false;
    }

    if (Array.isArray(value)) {
      return value.every(
        (role) => !!authStore.user?.roles?.includes(role)
      );
    }

    return !!authStore.user?.roles?.includes(value);
  };

  const roleAny = (values: [RoleName, ...RoleName[]]): boolean => {
    if (!values || !values.length) {
      return false;
    }

    return values.some((value) => role(value));
  };

  const subscribed = (value?: string | [string, ...string[]]): boolean => {
    if (!value || !subscriptionStore.plans.length) {
      return false;
    }

    if (Array.isArray(value)) {
      return value.every(
        (plan) => !!subscriptionStore.plans.find((p) => p.name === plan)
      );
    }

    return !!subscriptionStore.plans.find((p) => p.name === value);
  };

  const subscribedAny = (values: [string, ...string[]]): boolean => {
    if (!values || !values.length) {
      return false;
    }

    return values.some((value) => subscribed(value));
  };

  const patchworks = (): boolean => {
    return roleAny(['patchworks admin', 'patchworks user']);
  };

  const patchworksAdmin = (): boolean => {
    return role('patchworks admin');
  };

  const developer = (): boolean => {
    return role('developer');
  };

  const canViewDetailedLogs = (): boolean => {
    return true;
  };

  return {
    provide: {
      can,
      canAny,
      cannot,
      role,
      roleAny,
      subscribed,
      subscribedAny,
      patchworks,
      patchworksAdmin,
      developer,
      canViewDetailedLogs,
    },
  };
});
