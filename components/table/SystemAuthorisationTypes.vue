<template>
  <DataTable
    :value="filteredSystemAuthorisationTypes"
    :paginator="true"
    :lazy="true"
    :rows="systemAuthorisationTypes?.meta?.per_page"
    v-model:filters="filters"
    :totalRecords="systemAuthorisationTypes?.meta?.total"
    :loading="$fetchState.pending || loading"
    responsiveLayout="scroll"
    scrollHeight="500px"
    @page="onPage($event)"
    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} system authorisation types"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <NuxtLink
            custom
            v-slot="{ navigate }"
            :to="{
              name: 'admin-manage-systems-systemId-manage-authorisation-types-create',
              params: { systemId: systemId },
            }"
          >
            <button
              type="button"
              class="button button-primary button-sm"
              @click="navigate"
            >
              Add system authorisation type
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
            v-model="searchValue"
          />
        </div>
      </div>
    </template>
    <Column field="authorisation_type.name" header="Name">
      <template #body="{ data: systemAuthorisationType }">
        <div class="flex w-full items-center justify-between">
          <NuxtLink
            class="text-primary-600 cursor-pointer font-medium hover:underline"
            :to="{
              name: 'admin-manage-systems-systemId-manage-authorisation-types-systemAuthorisationTypeId',
              params: {
                systemId: systemId,
                systemAuthorisationTypeId: systemAuthorisationType.id,
              },
            }"
          >
            {{ systemAuthorisationType.authorisation_type.name }}
          </NuxtLink>
        </div>
      </template>
    </Column>
    <template #empty>No system authorisation types found.</template>
  </DataTable>
</template>

<script>
export default defineNuxtComponent({
  name: 'SystemAuthorisationTypesTable',
  props: {
    systemId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      systemAuthorisationTypes: {},
      searchValue: '',
      filters: {
        page: 0,
      },
    };
  },
  async fetch() {
    await this.getSystemAuthorisationTypes();
  },
  computed: {
    queryParams() {
      return {
        page: this.filters.page + 1,
        'filter[system_id]': this.systemId,
        include: ['authorisationType'].join(','),
        perPage: 100,
      };
    },
    filteredSystemAuthorisationTypes() {
      if (
        !this.systemAuthorisationTypes.data ||
        !this.systemAuthorisationTypes.data.length
      ) {
        return [];
      }

      return this.systemAuthorisationTypes.data.filter(
        (systemAuthorisationType) =>
          systemAuthorisationType.authorisation_type.name
            .toLowerCase()
            .includes(this.searchValue.toLowerCase())
      );
    },
  },
  methods: {
    onPage(e) {
      this.filters.page = e.page;

      this.getSystemAuthorisationTypes();
    },
    async getSystemAuthorisationTypes() {
      this.loading = true;
      try {
        this.systemAuthorisationTypes = await useFabric(
          '/api/v2/system-authorisation-types',
          {
            query: this.queryParams,
          }
        );
      } catch (error) {
        console.log(error);
        this.notify('error', 'Failed to load system authorisation types.');
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>
