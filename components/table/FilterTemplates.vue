<template>
  <DataTable
    :value="filteredTemplates"
    :paginator="true"
    :lazy="true"
    :rows="filterTemplates?.meta?.per_page"
    v-model:filters="filters"
    :totalRecords="filterTemplates?.meta?.total"
    :loading="$fetchState.pending || loading"
    responsiveLayout="scroll"
    scrollHeight="500px"
    @page="onPage($event)"
    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} filter templates"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <NuxtLink
            custom
            v-slot="{ navigate }"
            :to="{
              name: 'admin-manage-systems-systemId-manage-filter-templates-create',
              params: { systemId: systemId },
            }"
          >
            <button
              type="button"
              class="button button-primary button-sm"
              @click="navigate"
            >
              Add filter template
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
    <Column
      header="Factory"
      field="factory_system.service_factory.name"
      class="min-w-[150px]"
    >
      <template #body="{ data: filterTemplate }">
        <NuxtLink
          class="text-primary-600 cursor-pointer font-medium hover:underline"
          :to="{
            name: 'admin-manage-systems-systemId-manage-filter-templates-filterTemplateId',
            params: { systemId: systemId, filterTemplateId: filterTemplate.id },
          }"
        >
          {{ filterTemplate.factory_system.service_factory.name }}
        </NuxtLink>
      </template>
    </Column>
    <Column header="Direction" field="factory_system.direction">
      <template #body="{ data: filterTemplate }">
        {{ filterTemplate.factory_system.direction }}
      </template>
    </Column>
    <Column header="Filter Key" field="filter_key">
      <template #body="{ data: filterTemplate }">
        {{ filterTemplate.filter_key }}
      </template>
    </Column>
    <Column header="Template" field="template">
      <template #body="{ data: filterTemplate }">
        {{ filterTemplate.template }}
      </template>
    </Column>
    <Column header="PW Value" field="pw_value_field">
      <template #body="{ data: filterTemplate }">
        {{ filterTemplate.pw_value_field }}
      </template>
    </Column>
    <template #empty>No filter templates found.</template>
  </DataTable>
</template>

<script>
export default defineNuxtComponent({
  name: 'FilterTemplatesTable',
  props: {
    systemId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      filterTemplates: {},
      searchValue: '',
      filters: {
        page: 0,
      },
    };
  },
  async fetch() {
    await this.getFilterTemplates();
  },
  computed: {
    queryParams() {
      return {
        page: this.filters.page + 1,
        'filter[factorySystem.system_id]': this.systemId,
        include: ['factorySystem.serviceFactory', 'factorySystem.entity'].join(
          ','
        ),
        perPage: 100,
      };
    },
    filteredTemplates() {
      if (!this.filterTemplates.data || !this.filterTemplates.data.length) {
        return [];
      }

      return this.filterTemplates.data.filter((filterTemplate) =>
        filterTemplate.factory_system.service_factory.name
          .toLowerCase()
          .includes(this.searchValue.toLowerCase())
      );
    },
  },
  methods: {
    onPage(e) {
      this.filters.page = e.page;

      this.getFilterTemplates();
    },
    async getFilterTemplates() {
      this.loading = true;
      try {
        this.filterTemplates = await useFabric('/api/v2/filter-templates', {
          query: this.queryParams,
        });
      } catch (error) {
        console.log(error);
        this.notify('error', 'Failed to load filter templates.');
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>
