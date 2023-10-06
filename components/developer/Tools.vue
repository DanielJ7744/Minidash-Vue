<template>
  <UiSlideOver
    :open="open"
    v-if="enabled"
    wide
    fromRight
    :mobile-only="false"
    @close="open = false"
  >
    <div class="w-96 space-y-6 px-4 py-8">
      <h6 class="h6">Developer Tools</h6>

      <div>
        <FormElement label="Roles">
          <MultiSelect
            class="w-full"
            v-model="currentRoles"
            :options="roleOptions"
            optionLabel="name"
            placeholder="Select roles"
            :loading="!loaded"
          >
            <template #value="{ value }">
              {{ loaded ? pluralise('role', value?.length, true) : '-' }}
            </template>
          </MultiSelect>
        </FormElement>
      </div>

      <div>
        <FormElement label="Permissions">
          <MultiSelect
            class="w-full"
            v-model="currentPermissions"
            :options="permissionOptions"
            optionLabel="name"
            placeholder="Select permissions"
            :loading="!loaded"
            filter
          >
            <template #value="{ value }">
              {{ loaded ? pluralise('permission', value?.length, true) : '-' }}
            </template>
          </MultiSelect>
        </FormElement>
      </div>

      <div class="flex justify-end">
        <button @click.prevent="reset" class="button button-icon my-2 text-sm">
          Reset
        </button>
      </div>
    </div>
  </UiSlideOver>
</template>

<script setup lang="ts">
import type { Role, Permission } from '@/types/fabric/v2';

const authStore = useAuthStore();
const { $patchworksAdmin } = useNuxtApp();
const bus = useEventBus('developer.tools');

type RoleOption = {
  name: Role['name'];
  value: Role['name'];
};

type PermissionOption = {
  name: Permission['name'];
  value: Permission['name'];
};

bus.on(() => (open.value = true));

const open = shallowRef(false);
const loaded = shallowRef(false);
const enabled = shallowRef($patchworksAdmin());

const originalRoles = ref(authStore.user!.roles);
const roleOptions = ref<RoleOption[]>([]);
const currentRoles = ref<RoleOption[]>([]);

const originalPermissions = ref(authStore.user!.permissions || []);
const permissionOptions = ref<PermissionOption[]>([]);
const currentPermissions = ref<PermissionOption[]>([]);

const rolesAsOptions = (
  roles: Role['name'][] = []
): RoleOption[] =>
  roles.map((role) => ({
    name: role,
    value: role,
  }));

const permissionsAsOptions = (
  permissions: Permission['name'][] = []
): PermissionOption[] =>
  permissions.map((permission) => ({
    name: permission,
    value: permission,
  }));

const reset = () => {
  authStore.user!.roles = originalRoles.value;
  currentRoles.value = rolesAsOptions(originalRoles.value);

  authStore.user!.permissions = originalPermissions.value;
  currentPermissions.value = permissionsAsOptions(originalPermissions.value);
};

whenever(open, async () => {
  if (loaded.value) {
    return;
  }

  const { data: fabricRoles } = await useFabric<{ data: Role[] }>(
    '/api/v2/roles',
    { params: { include: 'permissions' } }
  );

  roleOptions.value = rolesAsOptions(fabricRoles.map((role: Role) => role.name));
  currentRoles.value = rolesAsOptions(authStore.user!.roles);

  permissionOptions.value = permissionsAsOptions(
    fabricRoles
      .reduce(
        (acc, role) =>
          acc.concat(role.permissions!.map((permission) => permission.name)),
        [] as Permission['name'][]
      )
      .filter((v, i, a) => a.indexOf(v) === i)
  );
  currentPermissions.value = permissionsAsOptions(authStore.user!.permissions);

  loaded.value = true;

  watch(currentRoles, (selectedRoles) => {
    authStore.user!.roles = selectedRoles.map((role) => role.value)
  });
  watch(currentPermissions, (selectedPermissions) => {
    authStore.user!.permissions = selectedPermissions.map((role) => role.value);
  });
});
</script>
