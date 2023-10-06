<template>
  <UiLoading v-if="$fetchState.pending || dataLoading" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <template v-else>
    <div
      v-if="manageBi && reachedBiUserLimit"
      class="text-danger flex items-center justify-between px-2 pt-4"
    >
      You have reached your active user limit for BI. Please upgrade your
      subscription.
    </div>
    <DataTable :value="filteredUsers" responsiveLayout="scroll">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <NuxtLink
              v-if="$can('create users')"
              custom
              v-slot="{ navigate }"
              :to="{
                name: 'user-create',
              }"
            >
              <button
                type="button"
                class="button button-primary button-sm"
                @click="navigate"
              >
                Add user
              </button>
            </NuxtLink>
          </div>

          <div class="relative mt-1 rounded-md shadow-sm">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-5 w-5 text-gray-400"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <input
              type="text"
              name="company-search"
              id="company-search"
              autocomplete="company-search"
              class="block w-full rounded-md pl-10"
              placeholder="Search..."
              v-model="userSearchValue"
            />
          </div>
        </div>
      </template>
      <Column field="name" header="Name" :sortable="true">
        <template #body="{ data: user }">
          <p class="font-medium">
            <span v-if="user.deleted_at" class="line-through">
              {{ user.name }}
            </span>
            <NuxtLink
              v-else
              :to="{
                name: 'user-userId',
                params: {
                  userId: user.id,
                },
              }"
            >
              {{ user.name }}
            </NuxtLink>
          </p>
        </template>
      </Column>
      <Column field="email" header="Email" :sortable="true" />
      <Column
        header="Roles"
        v-if="filteredUsers?.some((user) => user.roles?.length)"
      >
        <template #body="{ data: user }">
          <span v-html="user.roles?.join('<br>') || '-'"></span>
        </template>
      </Column>
      <Column>
        <template #body="{ data: user }">
          <div class="text-right">
            <div
              v-if="user.deleted_at === null"
              class="border-b border-gray-300 pb-3 md:border-0 md:pb-0"
            >
              <template v-if="manageBi">
                <button
                  v-if="
                    user.bi_company_id && user.bi_company_id === user.company_id
                  "
                  type="button"
                  class="button button-danger button-sm"
                  :disabled="isManagingBiUsers"
                  @click="revokeBiAccess(user.id)"
                >
                  Revoke BI Access
                </button>
                <button
                  v-else
                  type="button"
                  class="button button-primary button-sm"
                  :disabled="isManagingBiUsers"
                  @click="grantBiAccess(user.id)"
                >
                  Grant BI Access
                </button>
              </template>
            </div>
            <div v-else>
              <button
                type="button"
                class="button button-danger button-sm"
                @click="setUserToRestore(user)"
              >
                Reactivate
              </button>
            </div>
          </div>
        </template>
      </Column>

      <template #empty>No users found.</template>
    </DataTable>
    <Modal id="activateConfirmation" title="Are you sure?">
      <UsersUserActivateConfirmationModal
        :is-activate="true"
        warning-text="Please confirm that you want to activate this user."
        @cancel="closeModal"
        @confirm="restoreUser"
      />
    </Modal>
  </template>
</template>

<script>
import { mapState, mapActions } from 'pinia';

export default {
  name: 'UsersTable',
  props: {
    companyId: {
      type: Number,
      required: false,
      default: null,
    },
    manageBi: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      userSearchValue: '',
      userToRestore: null,
      trashedUsers: [],
      activeUsers: [],
      allUsers: [],
      dataLoading: false,
      isManagingBiUsers: false,
      reachedBiUserLimit: false,
    };
  },
  async fetch() {
    await this.loadUsers();
  },
  computed: {
    ...mapState(useSubscriptionStore, ['biPlan', 'usage']),
    filteredUsers() {
      if (!this.allUsers?.length) {
        return [];
      }

      return this.allUsers.filter((row) => {
        if ('name' in row && row.name !== null) {
          return row.name
            .toLowerCase()
            .includes(this.userSearchValue.toLowerCase());
        }
        if ('email' in row && row.email !== null) {
          return row.email
            .toLowerCase()
            .includes(this.userSearchValue.toLowerCase());
        }
        return row.id;
      });
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    ...mapActions(useSubscriptionStore, { fetchSubscriptions: 'initialize' }),
    async loadUsers() {
      const { $patchworksAdmin } = useNuxtApp();

      const url = $patchworksAdmin()
        ? 'api/api/v2/admin/users'
        : 'api/api/v2/users';
      const params = $patchworksAdmin()
        ? { 'filter[company_id]': this.companyId, include: ['roles'] }
        : {};
      this.trashedUsers = await fetchAllPaginatedResults(this.$axios, url, {
        ...params,
        'filter[trashed]': 'only',
      });
      this.activeUsers = await fetchAllPaginatedResults(
        this.$axios,
        url,
        params
      );
      this.allUsers = this.activeUsers.concat(this.trashedUsers);
      this.dataLoading = false;
    },
    getInitials(name) {
      return name
        .split(/\s/)
        .reduce((response, word) => response + word.slice(0, 1), '');
    },
    isDeletedUser(user) {
      return user.deleted_at !== null;
    },
    setUserToRestore(user) {
      this.userToRestore = user;
      this.openModal('activateConfirmation');
    },
    async restoreUser() {
      this.dataLoading = true;
      this.closeModal();
      try {
        const { $patchworksAdmin } = useNuxtApp();

        const url = $patchworksAdmin()
          ? `/api/v2/admin/users/${this.userToRestore.id}/restore`
          : `/api/v2/users/${this.userToRestore.id}/restore`;
        await this.$axios.$post(url);
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully activated user.',
          },
          4000
        );
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed re-activating user. Error: ${error}`,
          },
          4000
        );
      }
      this.userToRestore = null;
      await this.loadUsers();
    },
    grantBiAccess(userId) {
      this.reachedBiUserLimit = false;
      if (this.usage.biUsers >= this.biPlan.users) {
        this.reachedBiUserLimit = true;
        return;
      }
      this.isManagingBiUsers = true;
      this.$axios
        .$post('/api/v2/bi-users', {
          user_id: userId,
        })
        .then(async (res) => {
          this.$notify(
            {
              group: 'notifications',
              type: 'success',
              text: 'Successfully added user to BI Subscription.',
            },
            4000
          );
          this.filteredUsers.find((user) => user.id === userId).bi_company_id =
            res.data.bi_company_id;
          this.$auth.fetchUser();
          await this.fetchSubscriptions();
        })
        .catch(() => {
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: 'Failed to add user to BI Subscription.',
            },
            4000
          );
        })
        .finally(() => {
          this.isManagingBiUsers = false;
        });
    },
    revokeBiAccess(userId) {
      this.isManagingBiUsers = true;
      this.reachedBiUserLimit = false;
      this.$axios
        .$delete(`/api/api/v2/bi-users/${userId}`)
        .then(async (res) => {
          this.$notify(
            {
              group: 'notifications',
              type: 'success',
              text: 'Successfully removed user from BI Subscription.',
            },
            4000
          );
          this.filteredUsers.find((user) => user.id === userId).bi_company_id =
            res.data.bi_company_id;
          this.$auth.fetchUser();
          await this.fetchSubscriptions();
        })
        .catch(() => {
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: 'Failed to remove user from BI Subscription.',
            },
            4000
          );
        })
        .finally(() => {
          this.isManagingBiUsers = false;
        });
    },
  },
};
</script>
