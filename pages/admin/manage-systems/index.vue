<template>
  <div>
    <Breadcrumb
      current-page="Manage Systems"
      :crumbs="{ Settings: '/settings' }"
    />

    <PageHeader>
      <template #title>Manage Systems</template>

      <template #description>
        <p>
          Systems are the endpoints which entity data (eg orders, customers,
          etc) is retrieved from and sent to.
        </p>
        <p>
          Systems are used alongside Filter Templates to enable an entity to be
          manually synced. The source System must exist in the Systems list for
          an entity from this System to be manually synced.
        </p>
      </template>
      <template #actions v-if="$can('create systems')">
        <NuxtLink :to="{ name: 'admin-manage-systems-create' }">
          <button class="button button-primary button-lg">
            <span class="text-xs icon icon--plus mr-2"></span>
            Create System
          </button>
        </NuxtLink>
      </template>
    </PageHeader>

    <DataTable
      :value="filteredSystems"
      :loading="loading"
      responsiveLayout="scroll"
      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} companies"
    >
      <template #header>
        <div class="justify-end flex">
          <FormElement
            title="system-search"
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
                id="system-search"
                type="text"
                autocomplete="system-search"
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
        :sortable="true"
      >
        <template #body="{ data: system }">
          <p class="font-medium">
            <NuxtLink
              :to="{
                name: 'admin-manage-systems-systemId',
                params: { systemId: system.id },
              }"
            >
              {{ system.name }}
            </NuxtLink>
          </p>
        </template>
      </Column>
      <Column
        header="Factory Name"
        field="factory_name"
        :showFilterMenu="false"
        :sortable="true"
      >
        <template #body="{ data: system }">
          <p>{{ system.factory_name }}</p>
        </template>
      </Column>

      <Column header="Documentation Link" field="factory_name">
        <template #body="{ data: system }">
          <template v-if="system.documentation_link">
            <p>
              <NuxtLink
                :to="system.documentation_link"
                external
                target="_blank"
              >
                Documentation
              </NuxtLink>
            </p>
          </template>
        </template>
      </Column>
      <Column header="Description" field="description">
        <template #body="{ data: system }">
          <p>
            {{ system.description }}
          </p>
        </template>
      </Column>
      <template #empty>No systems found</template>
    </DataTable>
  </div>
</template>

<script>
import { mapState } from 'pinia';

definePageMeta({
  can: 'manage systems',
});

export default defineNuxtComponent({
  name: 'Index',
  data() {
    return {
      loading: false,
      filters: {
        page: 0,
        name: { value: null },
        sortField: 'name',
        sortOrder: 1,
      },
    };
  },
  async asyncData({ $pinia }) {
    const systemStore = useSystemStore($pinia);

    await systemStore.loadSystems();

    return {};
  },
  computed: {
    ...mapState(useSystemStore, {
      systems: 'systems',
    }),
    filteredSystems() {
      return this.filters.name.value
        ? this.systems.filter((system) => {
            return system.name
              .toLowerCase()
              .includes(this.filters.name.value.toLowerCase());
          })
        : this.systems;
    },
  },
});
</script>
