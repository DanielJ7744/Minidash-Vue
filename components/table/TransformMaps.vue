<template>
  <DataTable :value="filteredMaps" responsiveLayout="scroll">
    <template #header>
      <div class="justify-end flex">
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
            name="company-search"
            id="company-search"
            autocomplete="company-search"
            class="block w-full rounded-md pl-10"
            placeholder="Search..."
            v-model="searchValue"
          />
        </div>
      </div>
    </template>
    <Column header="Name" field="name" :show-filter-menu="false">
      <template #body="{ data: transformMap }">
        <p class="font-medium">
          <NuxtLink
            :to="{
              name: 'settings-transform-maps-transformMapId',
              params: { transformMapId: transformMap.id },
            }"
          >
            {{ transformMap.name }}
          </NuxtLink>
        </p>
      </template>
    </Column>
    <Column header="Description" field="description" :show-filter-menu="false">
      <template #body="{ data: transformMap }">
        <p>{{ transformMap.description }}</p>
      </template>
    </Column>

    <template #empty>No transform maps found.</template>
  </DataTable>
</template>

<script>
export default {
  name: 'TransformMapsTable',
  props: {
    transformMaps: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      searchValue: '',
    };
  },
  computed: {
    filteredMaps() {
      return this.transformMaps.filter(
        map =>
          map.name.toLowerCase().includes(this.searchValue) ||
          map.description.toLowerCase().includes(this.searchValue)
      );
    },
  },
};
</script>
