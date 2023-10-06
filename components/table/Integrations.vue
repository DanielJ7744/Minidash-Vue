<template>
  <DataTable
    :value="integrations?.data"
    :lazy="true"
    :paginator="true"
    :rows="integrations?.meta?.per_page"
    v-model:filters="filters"
    :totalRecords="integrations?.meta?.total"
    :loading="loading"
    @page="onPage($event)"
    @sort="onSort($event)"
    @filter="onFilter($event)"
    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} integrations"
  >
    <template #header>
      <div class="flex items-center justify-end gap-x-3">
        <FormElement
          title="company-search"
          v-model="filters.name.value"
          v-slot="{ inputProps, inputEvents }"
          focus
        >
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
              id="company-search"
              type="text"
              autocomplete="company-search"
              class="block w-full rounded-md pl-10"
              placeholder="Search..."
              v-bind="inputProps"
              v-on="inputEvents"
            />
          </div>
        </FormElement>
      </div>
    </template>
    <Column header="Name" field="name" :showFilterMenu="false" :sortable="true">
      <template #body="{ data: integration }">
        <p class="font-medium">
          <NuxtLink
            :to="{
              name: 'admin-manage-integrations-integrationId',
              params: { integrationId: integration.id },
            }"
          >
            {{ integration.name }}
          </NuxtLink>
        </p>
      </template>
    </Column>
    <Column header="Username" field="username" :showFilterMenu="false">
      <template #body="{ data: integration }">
        <p class="font-medium">
          {{ integration.username }}
        </p>
      </template>
    </Column>
    <Column header="Server" field="server" :showFilterMenu="false">
      <template #body="{ data: integration }">
        <p class="font-medium">
          {{ integration.server }}
        </p>
      </template>
    </Column>
    <template #empty>No integrations found</template>
  </DataTable>
</template>
<script>
export default defineNuxtComponent({
  name: 'IntegrationTable',
  data() {
    return {
      loading: false,
      integrations: {},
      filters: {
        page: 0,
        name: { value: null },
        sortField: 'name',
        sortOrder: 1,
      },
    };
  },
  async asyncData() {
    return {
      integrations: await useFabric('/api/v2/admin/integrations'),
    };
  },
  computed: {
    queryParams() {
      const filters = {
        page: this.filters.page + 1,
      };
      if (this.filters.sortField) {
        filters['sort'] =
          this.filters.sortOrder === 1
            ? this.filters.sortField
            : `-${this.filters.sortField}`;
      }
      if (this.filters.name?.value) {
        filters['filter[name]'] = this.filters.name.value;
      }
      return filters;
    },
  },
  watch: {
    'filters.name.value': useDebounceFn(function () {
      this.getIntegrations();
    }, 750),
    'filters.dateRange.value': useDebounceFn(function () {
      this.getIntegrations();
    }, 750),
  },
  methods: {
    onSort(e) {
      this.filters.sortField = e.sortField;
      this.filters.sortOrder = e.sortOrder;
      this.getIntegrations();
    },
    onPage(e) {
      this.filters.page = e.page;
      this.getIntegrations();
    },
    onFilter(e) {
      this.filters.page = 0;
      this.getIntegrations();
    },
    async getIntegrations() {
      this.loading = true;
      this.integrations = await useFabric('/api/v2/admin/integrations', {
        params: this.queryParams,
      });
      this.loading = false;
    },
  },
});
</script>
