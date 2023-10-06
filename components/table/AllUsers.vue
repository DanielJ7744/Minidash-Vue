<template>
  <DataTable :value="users" responsiveLayout="scroll">
    <template #header>
      <div class="flex items-center justify-end">
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
            name="user-search"
            id="user-search"
            autocomplete="user-search"
            class="block w-full rounded-md pl-10"
            placeholder="Search..."
            v-model="searchTerm"
          />
        </div>
      </div>
    </template>
    <Column field="name" header="Name" :sortable="true">
      <template #body="{ data: user }">
        <p
          class="text-primary-600 cursor-pointer font-medium hover:underline"
          :class="{ 'pointer-events-none line-through': user.deleted_at }"
          @click="manageUser(user)"
        >
          {{ user.name }}
        </p>
      </template>
    </Column>
    <Column field="email" header="Email" :sortable="true" />
    <Column
      field="company.name"
      header="Company"
      class="hidden md:table-cell"
      :sortable="true"
    >
      <template #body="{ data: user }">
        {{ user.company ? user.company.name : 'No Company Assigned' }}
      </template>
    </Column>
    <Column header="User Level" class="hidden md:table-cell">
      <template #body="{ data: user }">
        <div v-if="user.roles && user.roles.length">
          <span v-html="user.roles?.join('<br>') || '-'"></span>
        </div>
        <div v-else>No role assigned</div>
      </template>
    </Column>
    <Column
      field="deleted_at"
      header="Active?"
      class="hidden md:table-cell"
      :sortable="true"
    >
      <template #body="{ data: user }">
        {{ user.deleted_at === null ? 'Yes' : 'No' }}
      </template>
    </Column>
    <Column field="deleted_at">
      <template #body="{ data: user }">
        <button
          v-if="user.deleted_at"
          type="button"
          class="button button-danger float-right"
          @click="reActivateUser(user)"
        >
          Re-Activate User
        </button>
      </template>
    </Column>
  </DataTable>
  <div>
    <p class="mt-5 mb-3 text-center">
      Showing {{ resultsLoadedCount }} out of {{ totalResults }} results
      <br />
    </p>
    <div class="mt-5 flex justify-center">
      <button
        type="button"
        class="button button-primary"
        :disabled="!canLoadMore"
        @click="getNextPage()"
      >
        Load more
      </button>
    </div>
  </div>
  <Modal id="activateConfirmation" title="Are you sure?" classes="modal--small">
    <UsersUserActivateConfirmationModal
      :is-activate="true"
      warning-text="Please confirm that you want to activate this user."
      @cancel="closeModal"
      @confirm="restoreUser"
    />
  </Modal>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'AllUsers',
  data() {
    return {
      users: [],
      headings: ['Name', 'Email', 'Company', 'User Level', 'Active?'],
      searchTerm: '',
      currentPage: 1,
      totalResults: 0,
      totalPages: 0,
      userToRestore: null,
    };
  },
  async fetch() {
    this.userToRestore = null;
    await this.getUsers();
  },
  computed: {
    canLoadMore() {
      return this.currentPage < this.totalPages;
    },
    endpoint() {
      return `/api/api/v2/admin/users?include=company,roles&filter[search]=${this.searchTerm}&filter[trashed]=with&page=${this.currentPage}`;
    },
    resultsLoadedCount() {
      return this.users.length;
    },
  },
  watch: {
    searchTerm: useDebounceFn(function () {
      this.currentPage = 1;
      this.getUsers();
    }, 750),
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    async getUsers() {
      this.users = await this.$axios
        .$get(this.endpoint)
        .then((response) => {
          this.totalResults = response.meta.total;
          this.totalPages = response.meta.last_page;

          return response.data;
        })
        .catch(() => {
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: 'Sorry, failed to retrieve users.',
            },
            4000
          );
        });
    },
    getNextPage() {
      this.currentPage++;
      this.$axios
        .$get(this.endpoint)
        .then((response) => {
          this.users.push(...response.data);
        })
        .catch(() => {
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: 'Sorry, failed to retrieve users.',
            },
            4000
          );
        });
    },
    manageUser(user) {
      if (user.deleted_at === null) {
        navigateTo({
          name: 'user-userId',
          params: {
            crumbsName: 'Manage Users',
            redirectUrl: '/user-userId',
            userId: user.id,
          },
        });
      }
    },
    reActivateUser(user) {
      this.userToRestore = user;
      this.openModal('activateConfirmation');
    },
    async restoreUser() {
      this.closeModal();
      try {
        const url = this.$patchworksAdmin
          ? `/api/api/v2/admin/users/${this.userToRestore.id}/restore`
          : `/api/api/v2/users/${this.userToRestore.id}/restore`;
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
      this.$router.go();
    },
  },
};
</script>
