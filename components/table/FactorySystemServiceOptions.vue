<template>
  <DataTable
    :loading="$fetchState.pending"
    :value="filteredOptions"
    :lazy="true"
    responsiveLayout="scroll"
    scrollHeight="500px"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <NuxtLink
            custom
            v-slot="{ navigate }"
            :to="{
              name: 'admin-manage-systems-systemId-manage-factory-systems-factorySystemId-manage-options-create',
              params: { systemId: systemId, factorySystemId: factorySystemId },
            }"
          >
            <button
              type="button"
              class="button button-primary button-sm"
              @click="navigate"
            >
              Add factory system service option
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
    <Column header="Key" field="key" :showFilterMenu="false">
      <template #body="{ data: factorySystemServiceOption }">
        <p class="font-medium">
          <NuxtLink
            :to="{
              name: 'admin-manage-systems-systemId-manage-factory-systems-factorySystemId-manage-options-factorySystemServiceOptionId',
              params: {
                systemId: systemId,
                factorySystemId: factorySystemId,
                factorySystemServiceOptionId: factorySystemServiceOption.id,
              },
            }"
          >
            {{ factorySystemServiceOption.service_option.key }}
          </NuxtLink>
        </p>
      </template>
    </Column>
    <Column
      header="Default Value"
      field="default_value"
      :showFilterMenu="false"
    >
      <template #body="{ data: factorySystemServiceOption }">
        <p>
          {{ factorySystemServiceOption.value }}
        </p>
      </template>
    </Column>
    <Column
      header="User Configurable"
      field="user_configurable"
      :showFilterMenu="false"
    >
      <template #body="{ data: factorySystemServiceOption }">
        <p>
          {{ factorySystemServiceOption.user_configurable }}
        </p>
      </template>
    </Column>
    <Column header="Value Type" field="value_type" :showFilterMenu="false">
      <template #body="{ data: factorySystemServiceOption }">
        <p>
          {{ factorySystemServiceOption.value_type }}
        </p>
      </template>
    </Column>
    <template #empty>No options found.</template>
  </DataTable>
</template>

<script>
export default defineNuxtComponent({
  name: 'FactorySystemServiceOptionsTable',
  props: {
    systemId: {
      type: Number,
      required: true,
    },
    factorySystemId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      factorySystemServiceOptions: {},
      searchValue: '',
    };
  },
  async fetch() {
    this.factorySystemServiceOptions = await useFabric(
      `/api/v2/factory-systems/${this.factorySystemId}/factory-system-service-options`,
      {
        query: { include: 'serviceOption' },
      }
    ).then((r) => r.data);
  },
  computed: {
    filteredOptions() {
      if (!this.factorySystemServiceOptions.length) {
        return [];
      }

      return this.factorySystemServiceOptions.filter(
        (factorySystemServiceOption) =>
          factorySystemServiceOption.service_option.key
            .toLowerCase()
            .includes(this.searchValue.toLowerCase())
      );
    },
  },
});
</script>
