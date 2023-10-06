<template>
  <DataTable :value="filteredFactories">
    <template #header>
      <div class="justify-end flex items-center">
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
            name="factory-search"
            id="factory-search"
            autocomplete="factory-search"
            class="block w-full rounded-md pl-10"
            placeholder="Search..."
            v-model="searchValue"
          />
        </div>
      </div>
    </template>
    <Column field="name" header="Name" :sortable="true">
      <template #body="{ data: factory }">
        <div class="flex flex-col justify-center">
          <p class="font-medium">
            <NuxtLink
              :to="{
                name: 'admin-manage-factories-factoryId',
                params: { factoryId: factory.id },
              }"
            >
              {{ factory.name }}
            </NuxtLink>
          </p>
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<script>
export default {
  name: 'Factories',
  data() {
    return {
      factories: [],
      searchValue: '',
    };
  },
  async fetch() {
    await this.getFactories();
  },
  computed: {
    filteredFactories() {
      return this.factories.filter(row => {
        if ('name' in row && row.name !== null) {
          return row.name
            .toLowerCase()
            .includes(this.searchValue.toLowerCase());
        }
        return row.id;
      });
    },
  },
  methods: {
    async getFactories() {
      try {
        this.factories = await fetchAllPaginatedResults(
          this.$axios,
          'api/v2/factories',
          {
            perPage: 100,
          }
        );
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed getting factories. Error: ${error}`,
          },
          4000
        );
      }
    },
  },
};
</script>
