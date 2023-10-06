<template>
  <DataTable :value="filteredEntities">
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
            name="entity-search"
            id="entity-search"
            autocomplete="entity-search"
            class="block w-full rounded-md pl-10"
            placeholder="Search..."
            v-model="searchValue"
          />
        </div>
      </div>
    </template>
    <Column field="name" header="Name" :sortable="true">
      <template #body="{ data: entity }">
        <div class="flex flex-col justify-center">
          <p class="font-medium">
            <NuxtLink
              :to="{
                name: 'admin-manage-entities-entityId',
                params: { entityId: entity.id },
              }"
            >
              {{ entity.name }}
            </NuxtLink>
          </p>
        </div>
      </template>
    </Column>
    <Column field="integration.name" header="Integration" />
  </DataTable>
</template>

<script>
export default {
  name: 'Entities',
  data() {
    return {
      entities: [],
      searchValue: '',
    };
  },
  async fetch() {
    await this.getEntities();
  },
  computed: {
    filteredEntities() {
      return this.entities.filter((row) => {
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
    async getEntities() {
      try {
        this.entities = await fetchAllPaginatedResults(
          this.$axios,
          'api/v2/admin/entities',
          {
            perPage: 100,
            include: 'integration',
          }
        );
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed getting entities. Error: ${error}`,
          },
          4000
        );
      }
    },
  },
};
</script>
