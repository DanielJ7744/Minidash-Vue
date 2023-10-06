<template>
  <DataTable
    :value="filteredServiceTemplateOptions"
    :lazy="true"
    :loading="$fetchState.pending"
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
              name: 'admin-manage-systems-systemId-manage-service-templates-serviceTemplateId-manage-options-create',
              params: {
                systemId: systemId,
                serviceTemplateId: serviceTemplateId,
              },
            }"
          >
            <button
              type="button"
              class="button button-primary button-sm"
              @click="navigate"
            >
              Add service template option
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
    <Column header="Key" field="key">
      <template #body="{ data: serviceTemplateOption }">
        <NuxtLink
          class="text-primary-600 cursor-pointer whitespace-normal font-medium hover:underline"
          :to="{
            name: 'admin-manage-systems-systemId-manage-service-templates-serviceTemplateId-manage-options-optionId',
            params: {
              systemId: systemId,
              serviceTemplateId: serviceTemplateId,
              optionId: serviceTemplateOption.id,
            },
          }"
        >
          {{ serviceTemplateOption.service_option.key }}
        </NuxtLink>
      </template>
    </Column>
    <Column header="Target" field="target">
      <template #body="{ data: serviceTemplateOption }">
        {{ serviceTemplateOption.target }}
      </template>
    </Column>
    <Column header="Value" field="value">
      <template #body="{ data: serviceTemplateOption }">
        {{ serviceTemplateOption.value }}
      </template>
    </Column>
    <Column header="User Configurable" field="user_configurable">
      <template #body="{ data: serviceTemplateOption }">
        {{ serviceTemplateOption.user_configurable ? 'Yes' : 'No' }}
      </template>
    </Column>
    <template #empty>No service template options found.</template>
  </DataTable>
</template>

<script>
export default defineNuxtComponent({
  name: 'ServiceTemplateOptionsTable',
  props: {
    systemId: {
      type: Number,
      required: true,
    },
    serviceTemplateId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      serviceTemplateOptions: {},
      searchValue: '',
    };
  },
  async fetch() {
    await this.getServiceTemplateOptions();
  },
  computed: {
    filteredServiceTemplateOptions() {
      if (!this.serviceTemplateOptions.length) {
        return [];
      }

      return this.serviceTemplateOptions.filter((serviceTemplateOption) =>
        serviceTemplateOption.service_option.key
          .toLowerCase()
          .includes(this.searchValue.toLowerCase())
      );
    },
  },
  methods: {
    async getServiceTemplateOptions() {
      try {
        this.serviceTemplateOptions = await useFabric(
          `api/v2/admin/service-templates/${this.serviceTemplateId}/options`
        ).then((r) => r.data);
      } catch (error) {
        console.log(error);
        this.notify('error', 'Failed to load filter templates.');
      }
    },
  },
});
</script>
