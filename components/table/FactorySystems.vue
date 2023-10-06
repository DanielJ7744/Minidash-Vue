<template>
  <DataTable
    :value="filteredFactorySystems"
    :paginator="true"
    :lazy="true"
    :rows="factorySystems?.meta?.per_page"
    v-model:filters="filters"
    :totalRecords="factorySystems?.meta?.total"
    :loading="$fetchState.pending || loading"
    responsiveLayout="scroll"
    scrollHeight="500px"
    @page="onPage($event)"
    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} factory systems"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <NuxtLink
            custom
            v-slot="{ navigate }"
            :to="{
              name: 'admin-manage-systems-systemId-manage-factory-systems-create',
              params: { systemId: systemId },
            }"
          >
            <button
              type="button"
              class="button button-primary button-sm"
              @click="navigate"
            >
              Add factory system
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
            name="factory-system-search"
            id="factory-system-search"
            autocomplete="factory-system-search"
            class="block w-full rounded-md pl-10"
            placeholder="Search..."
            v-model="searchValue"
          />
        </div>
      </div>
    </template>
    <Column header="Factory" field="service_factory.name">
      <template #body="{ data: factorySystem }">
        <NuxtLink
          class="text-primary-600 cursor-pointer font-medium hover:underline"
          :to="{
            name: 'admin-manage-systems-systemId-manage-factory-systems-factorySystemId',
            params: { systemId: systemId, factorySystemId: factorySystem.id },
          }"
        >
          {{ factorySystem.service_factory.name }}
        </NuxtLink>
      </template>
    </Column>
    <Column header="Entity" field="entity.name">
      <template #body="{ data: factorySystem }">
        {{ factorySystem.entity.name }}
      </template>
    </Column>
    <Column header="Direction" field="direction">
      <template #body="{ data: factorySystem }">
        {{ factorySystem.direction }}
      </template>
    </Column>
    <Column header="Default Map Name" field="default_map_name">
      <template #body="{ data: factorySystem }">
        {{ factorySystem.default_map_name }}
      </template>
    </Column>
    <Column field="id">
      <template #body="{ data: factorySystem }">
        <div class="flex w-full justify-end">
          <UiDropdownMenu
            :links="[
              {
                title: 'Manage Default Mapping',
                link: `/admin/manage-systems/${systemId}/manage-system-defaults/${factorySystem.id}/default-mapping`,
              },
              {
                title: 'Manage Default Schema',
                link: `/admin/manage-systems/${systemId}/manage-system-defaults/${factorySystem.id}/default-schema`,
              },
            ]"
          />
        </div>
      </template>
    </Column>
    <template #empty>No factory systems found.</template>
  </DataTable>
</template>

<script>
export default defineNuxtComponent({
  name: 'FactorySystemsTable',
  props: {
    systemId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      factorySystems: {},
      searchValue: '',
      filters: {
        page: 0,
      },
    };
  },
  async fetch() {
    this.factorySystems = await useFabric('/api/v2/factory-systems', {
      params: this.queryParams,
    });
  },
  computed: {
    filteredFactorySystems() {
      if (!this.factorySystems.data || !this.factorySystems.data.length) {
        return [];
      }

      return this.factorySystems.data.filter((row) => {
        if ('factory' in row && row.service_factory.name !== null) {
          return row.service_factory.name
            .toLowerCase()
            .includes(this.searchValue.toLowerCase());
        }
        if ('entity' in row && row.entity.name !== null) {
          return row.entity.name
            .toLowerCase()
            .includes(this.searchValue.toLowerCase());
        }
        if ('direction' in row && row.direction !== null) {
          return row.direction
            .toLowerCase()
            .includes(this.searchValue.toLowerCase());
        }
        return row.id;
      });
    },
    queryParams() {
      const filters = {
        page: this.filters.page + 1,
        include: 'serviceFactory,entity',
        'filter[system_id]': this.systemId,
      };

      return filters;
    },
  },
  methods: {
    onPage(e) {
      this.filters.page = e.page;

      this.getFactorySystems();
    },
    async getFactorySystems() {
      this.loading = true;
      try {
        this.factorySystems = await useFabric('/api/v2/factory-systems', {
          params: this.queryParams,
        });
      } catch (error) {
        console.log(error);
        this.notify('error', 'Failed to load factory systems.');
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>
