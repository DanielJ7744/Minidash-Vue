<template>
  <DataTable
    :value="customScripts?.data"
    :lazy="true"
    :paginator="true"
    :rows="customScripts?.meta?.per_page"
    v-model:filters="filters"
    :totalRecords="customScripts?.meta?.total"
    :loading="loading"
    @page="onPage($event)"
    @filter="onFilter($event)"
    responsiveLayout="scroll"
    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} custom scripts"
  >
    <template #header>
      <div class="justify-between flex">
        <button
          type="button"
          icon="pi pi-filter-slash"
          label="Clear"
          class="p-button-outlined"
          @click="clearFilter()"
        />
        <FormElement
          title="custom-script-search"
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
              id="custom-script-search"
              type="text"
              autocomplete="custom-script-search"
              class="block w-full rounded-md pl-10"
              placeholder="Search..."
              v-bind="inputProps"
              v-on="inputEvents"
            />
          </div>
        </FormElement>
      </div>
    </template>
    <Column
      header="Name"
      field="name"
      :showFilterMenu="false"
      :sortable="false"
    >
      <template #body="{ data: customScript }">
        <p class="font-medium">
          <NuxtLink
            :to="{
              name: 'settings-manage-scripts-scriptId',
              params: { scriptId: customScript.id },
            }"
          >
            {{ customScript.name }}
          </NuxtLink>
        </p>
      </template>
    </Column>
    <Column header="Description" field="description" :showFilterMenu="false">
      <template #body="{ data: customScript }">
        <p class="font-medium">{{ customScript.description }}</p>
      </template>
    </Column>
    <template #empty>No custom scripts found</template>
  </DataTable>
</template>

<script>
export default defineNuxtComponent({
  name: 'CustomScriptTable',
  data() {
    return {
      loading: false,
      customScripts: {},
      filters: {
        page: 0,
        name: { value: null },
      },
    };
  },
  async asyncData({ $pinia }) {
    const authStore = useAuthStore($pinia);

    return {
      customScripts: await useFabric(
        `/api/v1/transform-scripts/company/${authStore.user.company_id}/custom_scripts`
      ),
    };
  },
  computed: {
    queryParams() {
      const filters = {
        page: this.filters.page + 1,
      };

      if (this.filters.name?.value) {
        filters['filter[name]'] = this.filters.name.value;
      }

      return filters;
    },
  },
  watch: {
    'filters.name.value': useDebounceFn(function () {
      this.getCustomScripts();
    }, 750),
  },
  methods: {
    onPage(e) {
      this.filters.page = e.page;

      this.getCustomScripts();
    },
    onFilter(e) {
      this.filters.page = 0;

      this.getCustomScripts();
    },
    async getCustomScripts() {
      this.loading = true;

      this.customScripts = await useFabric(
        `/api/v1/transform-scripts/company/${this.$auth.user.company_id}/custom_scripts`,
        { params: this.queryParams }
      );

      this.loading = false;
    },
  },
});
</script>
