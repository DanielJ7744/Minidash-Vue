<template>
  <div class="mb-5 space-y-5">
    <Breadcrumb current-page="Audit Logs" :crumbs="{ Settings: `/Settings` }" />

    <PageHeader>
      <template #title>Audit Logs</template>
    </PageHeader>

    <div class="relative mt-1 rounded-md shadow-sm">
      <input
        id="audit-log-search"
        v-model="search"
        type="text"
        name="search"
        class="form-input block w-full rounded-md border-gray-300 py-3 pr-10 placeholder-gray-400 focus:border-gray-300 focus:ring-gray-300 sm:text-sm"
        placeholder="Search"
      />
      <div
        class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
      >
        <!-- Heroicon name: outline/search -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
    <template v-if="$fetchState.pending">
      <div class="px-4 py-2">
        <UiLoading label="Loading Data..." />
      </div>
    </template>
    <LogsAuditLogs v-else :logs="logs.data" />
    <div class="m-4">
      <div class="justify-center">
        Showing {{ resultsLoadedCount }} out of {{ totalResults }} results
        <br />
      </div>

      <div class="mt-2">
        <button
          class="button button-primary w-full p-3 text-xs"
          :disabled="!canLoadMore"
          @click="getNextPage()"
        >
          {{ canLoadMore ? `Load More` : `No more results` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuditLogs',
  data: () => ({
    search: '',
    tab: 'All',
    logs: {},
    currentPage: 1,
    totalResults: 0,
    totalPages: 0,
  }),
  async fetch() {
    this.logs = await this.$axios.$get(this.getUrl()).then((response) => {
      this.totalResults = response.meta.total;
      this.totalPages = response.meta.last_page;
      return response;
    });
  },
  computed: {
    resultsLoadedCount() {
      return this.logs?.data?.length;
    },
    canLoadMore() {
      return this.currentPage < this.totalPages;
    },
  },
  watch: {
    search: useDebounceFn(function () {
      this.currentPage = 0;
      this.searchUser();
    }, 1000),
  },
  methods: {
    async searchUser() {
      const url = this.$patchworksAdmin()
        ? `api/api/v2/admin/audit-logs/${this.search}?&page=${this.currentPage}&perPage=50`
        : `api/api/v2/audit-logs/${this.search}?&page=${this.currentPage}&perPage=50`;
      this.logs = await this.$axios.$get(url).then((response) => {
        this.totalResults = response.meta.total;
        this.totalPages = response.meta.last_page;
        return response;
      });
    },
    getNextPage() {
      this.currentPage++;
      this.$axios.$get(this.getUrl()).then((response) => {
        this.logs.data.push(...response.data);
      });
    },
    getUrl() {
      return this.$patchworksAdmin()
        ? `api/api/v2/admin/audit-logs?&page=${this.currentPage}&perPage=50`
        : `api/api/v2/audit-logs?&page=${this.currentPage}&perPage=50`;
    },
  },
};
</script>
