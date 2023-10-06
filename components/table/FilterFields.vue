<template>
  <DataTable
    :value="filterFields?.data"
    :paginator="true"
    :lazy="true"
    :rows="filterFields?.meta?.per_page"
    v-model:filters="filters"
    :totalRecords="filterFields?.meta?.total"
    :loading="$fetchState.pending || loading"
    responsiveLayout="scroll"
    scrollHeight="500px"
    @page="onPage($event)"
    @filter="onFilter($event)"
    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} filter fields"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <NuxtLink
            custom
            v-slot="{ navigate }"
            :to="{
              name: 'admin-manage-systems-systemId-manage-filter-fields-create',
              params: { systemId: systemId },
            }"
          >
            <button
              type="button"
              class="button button-primary button-sm"
              @click="navigate"
            >
              Add filter field
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
            name="filter-field-search"
            id="filter-field-search"
            autocomplete="filter-field-search"
            class="block w-full rounded-md pl-10"
            placeholder="Search..."
            v-model="filters.key.value"
          />
        </div>
      </div>
    </template>
    <Column header="Key" field="key">
      <template #body="{ data: filterField }">
        <NuxtLink
          class="text-primary-600 cursor-pointer font-medium hover:underline"
          :to="{
            name: 'admin-manage-systems-systemId-manage-filter-fields-filterFieldId',
            params: { systemId: systemId, filterFieldId: filterField.id },
          }"
        >
          {{ filterField.key }}
        </NuxtLink>
      </template>
    </Column>
    <Column header="Direction" field="factory_system.direction">
      <template #body="{ data: filterField }">
        {{ filterField.factory_system.direction }}
      </template>
    </Column>
    <Column header="Factory System" field="factory_system.entity.name">
      <template #body="{ data: filterField }">
        {{ filterField.factory_system.entity.name }} /
        {{ filterField.factory_system.service_factory.name }}
      </template>
    </Column>
    <Column header="Default" field="default">
      <template #body="{ data: filterField }">
        {{ filterField.default === 1 ? 'Yes' : 'No' }}
      </template>
    </Column>
    <template #empty>No filter fields found.</template>
  </DataTable>
</template>

<script>
export default defineNuxtComponent({
  name: 'FilterFieldsTable',
  props: {
    systemId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      filterFields: {},
      filters: {
        page: 0,
        key: { value: null },
      },
    };
  },
  async fetch() {
    this.filterFields = await useFabric('/api/v2/filter-fields', {
      query: this.queryParams,
    });
  },
  watch: {
    'filters.key.value': useDebounceFn(function () {
      this.getFilterFields();
    }, 750),
  },
  computed: {
    queryParams() {
      const filters = {
        page: this.filters.page + 1,
        'filter[factorySystem.system.id]': this.systemId,
        include: [
          'factorySystem.serviceFactory',
          'factorySystem.entity',
          'filterType.filterOperator',
          'filterOperator',
          'defaultType',
          'defaultOperator',
        ].join(','),
        perPage: 100,
      };

      if (this.filters.key?.value) {
        filters['filter[key]'] = this.filters.key.value;
      }

      return filters;
    },
  },
  methods: {
    onPage(e) {
      this.filters.page = e.page;

      this.getFilterFields();
    },
    onFilter(e) {
      this.filters.page = 0;

      this.getFilterFields();
    },
    async getFilterFields() {
      this.loading = true;
      try {
        this.filterFields = await useFabric('/api/v2/filter-fields', {
          query: this.queryParams,
        });
      } catch (error) {
        console.log(error);
        this.notify('error', 'Failed to load filter fields.');
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>
