<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <div v-else>
    <div class="mb-2">
      <input
        v-model="searchValue"
        type="text"
        placeholder="Search"
        class="w-full"
      />
    </div>
    <div class="py-2 border-b">
      <NuxtLink
        :to="{
          name: 'admin-manage-systems-systemId-manage-service-templates-serviceTemplateId-manage-options-create',
          params: { systemId: systemId, serviceTemplateId: serviceTemplateId },
        }"
      >
        <button type="button" class="button-empty">
          <span class="icon icon--add content--margin-right-5" />
          Add Service Option
        </button>
      </NuxtLink>
    </div>
    <div
      class="grid grid-cols-5 items-center border-b py-2 px-2 font-medium"
    >
      <div>Target</div>
      <div>Key</div>
      <div>Value</div>
      <div>User Configurable</div>
      <div />
    </div>
    <div
      v-if="filteredServiceTemplateOptions.length"
      class="overflow-auto max-h-60"
    >
      <div
        v-for="serviceTemplateOption in filteredServiceTemplateOptions"
        :key="'serviceTemplateOptionsList' + serviceTemplateOption.id"
      >
        <div
          class="grid grid-cols-5 items-center border-b py-2 px-2"
        >
          <div>
            {{ serviceTemplateOption.target }}
          </div>
          <div>
            {{ serviceTemplateOption.service_option.key }}
          </div>
          <div>
            {{ serviceTemplateOption.value }}
          </div>
          <div>
            {{ serviceTemplateOption.user_configurable ? 'Yes' : 'No' }}
          </div>
          <div>
            <NuxtLink
              tag="button"
              class="button button-secondary"
              :to="{
                name: 'admin-manage-systems-systemId-manage-service-templates-serviceTemplateId-manage-options-optionId',
                params: {
                  systemId: systemId,
                  serviceTemplateId: serviceTemplateId,
                  optionId: serviceTemplateOption.id,
                },
              }"
            >
              Manage
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    <div v-else>No service templates found.</div>
  </div>
</template>

<script>
export default {
  name: 'ServiceTemplateOptions',
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
      serviceTemplateOptions: null,
      searchValue: '',
    };
  },
  async fetch() {
    this.serviceTemplateOptions = await this.$axios
      .$get(
        `/api/api/v2/admin/service-templates/${this.serviceTemplateId}/options`
      )
      .then((r) => r.data);
  },
  computed: {
    filteredServiceTemplateOptions() {
      return this.serviceTemplateOptions.filter((row) => {
        if ('service_option' in row && row.service_option.key !== null) {
          return row.service_option.key
            .toLowerCase()
            .includes(this.searchValue.toLowerCase());
        }
        return row.id;
      });
    },
  },
};
</script>
