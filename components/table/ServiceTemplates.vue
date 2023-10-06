<template>
  <DataTable
    :value="filteredServiceTemplates"
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
              name: 'admin-manage-systems-systemId-manage-service-templates-create',
              params: { systemId },
            }"
          >
            <button
              type="button"
              class="button button-primary button-sm"
              @click="navigate"
            >
              Add service template
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
    <Column header="Name" field="name">
      <template #body="{ data: serviceTemplate }">
        <NuxtLink
          class="text-primary-600 cursor-pointer whitespace-normal font-medium hover:underline"
          :to="{
            name: 'admin-manage-systems-systemId-manage-service-templates-serviceTemplateId',
            params: {
              systemId: systemId,
              serviceTemplateId: serviceTemplate.id,
            },
          }"
        >
          {{ serviceTemplate.name }}
        </NuxtLink>
      </template>
    </Column>
    <Column header="Source" field="source_factory_system.system.name">
      <template #body="{ data: serviceTemplate }">
        <div
          v-if="serviceTemplate.source_factory_system"
          class="whitespace-normal"
        >
          {{ serviceTemplate.source_factory_system.system.name }}
          {{ serviceTemplate.source_factory_system.entity.name }}
        </div>
        <div v-else class="whitespace-normal">No source system found</div>
      </template>
    </Column>
    <Column header="Destination" field="destination_factory_system.system.name">
      <template #body="{ data: serviceTemplate }">
        <div
          v-if="serviceTemplate.destination_factory_system"
          class="whitespace-normal"
        >
          {{ serviceTemplate.destination_factory_system.system.name }}
          {{ serviceTemplate.destination_factory_system.entity.name }}
        </div>
        <div v-else class="whitespace-normal">No destination system found</div>
      </template>
    </Column>
    <Column header="Integration" field="integration.name">
      <template #body="{ data: serviceTemplate }">
        <div v-if="serviceTemplate.integration_id" class="whitespace-normal">
          {{ serviceTemplate.integration_id }}/{{
            serviceTemplate.integration.name
          }}
        </div>
        <div v-else class="whitespace-normal">Global</div>
      </template>
    </Column>
    <template #empty>No service templates found.</template>
  </DataTable>
</template>

<script>
export default defineNuxtComponent({
  name: 'ServiceTemplateTable',
  props: {
    systemId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      serviceTemplates: {},
      searchValue: '',
    };
  },
  async fetch() {
    await this.getServiceTemplates();
  },
  computed: {
    includeString() {
      return [
        'source.serviceFactory',
        'source.entity',
        'source.system',
        'destination.serviceFactory',
        'destination.entity',
        'destination.system',
        'integration',
      ].join(',');
    },
    filteredServiceTemplates() {
      if (!this.serviceTemplates.length) {
        return [];
      }

      return this.serviceTemplates.filter((serviceTemplate) =>
        serviceTemplate.name
          .toLowerCase()
          .includes(this.searchValue.toLowerCase())
      );
    },
  },
  methods: {
    async getServiceTemplates() {
      try {
        const sourceTemplates = await useFabric(
          '/api/v2/admin/service-templates',
          {
            query: {
              include: this.includeString,
              'filter[source.system_id]': this.systemId,
            },
          }
        ).then((r) => r.data);

        const destinationTemplates = await useFabric(
          '/api/v2/admin/service-templates',
          {
            query: {
              include: this.includeString,
              'filter[destination.system_id]': this.systemId,
            },
          }
        ).then((r) => r.data);

        this.serviceTemplates = sourceTemplates.concat(destinationTemplates);
      } catch (error) {
        console.log(error);
        this.notify('error', 'Failed to load filter templates.');
      }
    },
  },
});
</script>
