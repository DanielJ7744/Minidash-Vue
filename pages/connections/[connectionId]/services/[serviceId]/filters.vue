<template>
  <div class="page-container-fluid page-container relative space-y-5 divide-y">
    <div class="space-y-5">
      <div class="space-y-3 lg:flex lg:items-end lg:space-y-0">
        <div class="flex-1">
          <h1 class="m-0 text-2xl">Filters</h1>
        </div>
        <div v-if="$patchworksAdmin()">
          <button
            v-if="advanced"
            class="button button-secondary"
            @click="advanced = !advanced"
          >
            Basic Editor
          </button>
          <button
            v-else
            class="button button-secondary"
            @click="openModal('advancedEditor')"
          >
            Advanced Editor
          </button>
        </div>
      </div>
    </div>

    <UiLoading v-if="$fetchState.pending" />

    <form v-else class="divide-y" @submit.prevent="updateFilters">
      <UiTitledCard title="Service settings">
        <ServicesSettingsServiceFilterSettingsAdvanced
          v-if="advanced"
          v-model="jsonFiltersAdvanced"
          :service="service"
        />
        <ServicesSettingsServiceFilterSettings
          v-else
          v-model="jsonFilters"
          :filter-fields="filterFields"
          :service="service"
        />
      </UiTitledCard>

      <div class="flex flex-1 justify-end space-x-2 py-5">
        <button
          type="button"
          class="button button-secondary"
          @click="setJsonFilters(service)"
        >
          Cancel
        </button>
        <button
          v-if="isNewService"
          type="submit"
          class="button button-primary"
          :disabled="updating"
        >
          Next
        </button>
        <button
          v-else
          type="submit"
          class="button button-primary"
          :disabled="updating"
        >
          Save
        </button>
      </div>
    </form>

    <Modal id="advancedEditor" title="Are you sure?" classes="modal--small">
      <div class="mb-5">
        Editing the filters using the JSON editor may result in the filter UI
        being locked out to customers, please consider adding desired
        functionality to the filters UI.
      </div>
      <div class="mb-5 font-medium">
        Please be aware that this only saves data to the filters and not the
        whole from_options. If you wish to edit all of the from_options, please
        go to the Source page.
      </div>
      <button
        class="button button-primary w-full"
        @click="enableAdvancedEditor"
      >
        Use advanced editor
      </button>
    </Modal>

    <Modal
      id="emptyFilterWarning"
      classes="modal--small"
      title="Are you sure you wish to continue with these settings?"
      :close-on-backdrop-click="false"
    >
      <ServicesEmptyFilterWarning @confirm="patchService(filterPayload)" />
    </Modal>
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import { goToNextSetupStep } from '@/lib/serviceSetup';

const EventBus = useLegacyEventBus();

export default {
  name: 'Filters',
  props: {
    service: {
      type: Object,
      required: false,
      default: null,
    },
  },
  setup() {
    return {
      route: useRoute(),
    };
  },
  data: () => ({
    updating: false,
    advanced: false,
    jsonFilters: [],
    jsonFiltersAdvanced: {},
    filterFields: [],
  }),
  async fetch() {
    this.filterFields = await fetchAllPaginatedResults(
      this.$axios,
      '/api/api/v2/filter-fields',
      {
        'filter[factory_system_id]': this.service.source_factory_system.id,
        include:
          'factorySystem,filterOperator,filterType.filterOperator,defaultType,defaultOperator',
        perPage: 100,
      }
    );

    this.setJsonFilters(this.service);
  },
  computed: {
    filters() {
      if (!this.service.filters?.length) {
        return [];
      }

      return this.service.filters;
    },
    isNewService() {
      return this.route.query.path === 'new';
    },
    filterPayload() {
      return {
        from_options: {
          filters: this.advanced ? this.jsonFiltersAdvanced : this.jsonFilters,
        },
      };
    },
  },
  methods: {
    ...mapActions(useUiStore, ['openModal', 'closeModal']),
    setJsonFilters(service) {
      this.jsonFilters = service.filters ?? {};

      this.jsonFiltersAdvanced = service.from_options
        ? service.from_options.filters || {}
        : {};
    },
    enableAdvancedEditor() {
      this.closeModal('advancedEditor');

      this.advanced = true;
    },
    updateFilters() {
      if (this.jsonFilters.length === 0) {
        this.openModal('emptyFilterWarning');
      } else {
        this.patchService(this.filterPayload);
      }
    },
    async patchService(data) {
      this.updating = true;

      try {
        const service = await this.$axios.$patch(
          `/api/api/v2/services/${this.service.id}`,
          data
        );

        this.setJsonFilters(service.data);

        EventBus.emit('service:updated', this.service.id);

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved filters',
          },
          5000
        );

        if (this.isNewService) {
          goToNextSetupStep(
            'mapping',
            this.route.params.connectionId,
            this.route.params.serviceId
          );
        }
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: 'An error occurred, please check the filters for empty rows or errors',
          },
          4000
        );
      }

      this.updating = false;
    },
  },
};
</script>
