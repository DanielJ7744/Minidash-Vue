<template>
  <DataTable
    v-model:filters="tableFilters"
    v-model:selection="selectedRows"
    @filter="onFilter($event.filters)"
    @sort="onSort($event)"
    :loading="loading"
    :value="syncs"
    :lazy="true"
    dataKey="id"
    filterDisplay="menu"
    responsiveLayout="scroll"
    rowGroupMode="subheader"
    groupRowsBy="id"
  >
    <template #header>
      <div class="flex items-center justify-end">
        <UiDropdownMenu
          class="mr-2"
          :links="[
            {
              title: 'Download as CSV',
              action: () => $emit('launchDownloadCsv', data),
            },
            {
              title: 'Auto Resync',
              action: () => this.$emit('triggerAutoSync'),
              if: selectedRows.length,
            },
          ]"
        />
        <MultiSelect
          v-model="additionalFilterOptions"
          class="form-control mr-2"
          :options="[
            { label: 'Show Additional Sync Data', value: 'AdditionalData' },
            { label: 'Show Additional Fields', value: 'AdditionalFields' },
          ]"
          optionLabel="label"
          placeholder="Additional Filters"
        />
        <div class="relative">
          <span
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
          >
            <i class="pi pi-search"></i>
          </span>
          <input
            type="text"
            name="subscription-search"
            id="subscription-search"
            autocomplete="subscription-search"
            class="block rounded-md pl-10"
            placeholder="Search..."
            v-model="search"
          />
        </div>
      </div>
    </template>
    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
    <Column :showFilterMatchModes="false" field="status" header="Status">
      <template #body="{ data }">
        <UiBadge
          v-if="data.status === 'Failed'"
          orientation="right"
          severity="danger"
        >
          Failed
        </UiBadge>
        <UiBadge
          v-else-if="data.status === 'Pending'"
          orientation="right"
          severity="info"
        >
          Pending
        </UiBadge>
        <UiBadge
          v-else-if="
            data.status === 'Ok' ||
            data.status === 'Sent' ||
            data.status === '_Sent'
          "
          orientation="right"
          severity="success"
        >
          {{ removeInitialUnderscore(data.status) }}
        </UiBadge>
        <UiBadge v-else orientation="right" severity="info">
          {{ data.status }}
        </UiBadge>
      </template>
      <template #filter>
        <label class="mt-2">Status</label>
        <select v-model="tableFilters.status.value" class="form-control w-full">
          <option selected disabled>Please select...</option>
          <option
            v-for="(status, idx) in filterOptions.statuses"
            :key="idx"
            :value="status"
          >
            {{ status }}
          </option>
        </select>
      </template>
      <template #filterclear>
        <button
          type="button"
          @click="clearFilter('status')"
          class="button button-secondary"
        >
          Clear
        </button>
      </template>
    </Column>
    <Column
      :showFilterMatchModes="false"
      :showClearButton="false"
      field="integration.name"
      header="Company Group"
    >
      <template #filter>
        <select
          v-model="tableFilters.integrations.value"
          class="form-control w-full"
        >
          <option
            v-for="group in filterOptions.companyGroups"
            :key="group.key"
            :value="group.key"
          >
            {{ group.label }}
          </option>
        </select>
      </template>
    </Column>
    <Column :showFilterMatchModes="false" field="type" header="Service Entity">
      <template #body="{ data }">
        <p>
          <span
            class="pr-2 text-gray-500"
            :class="getEntityIconClass(data.type)"
          />
          {{ data.type }}
        </p>
      </template>
      <template #filter>
        <label class="mt-2">Entity</label>
        <select v-model="tableFilters.type.value" class="form-control w-full">
          <option
            v-for="entity in filterOptions.availableEntities"
            :key="entity.key"
            :value="entity.key"
          >
            {{ entity.label }}
          </option>
        </select>
      </template>
      <template #filterclear>
        <button
          type="button"
          @click="clearFilter('type')"
          class="button button-secondary"
        >
          Clear
        </button>
      </template>
    </Column>
    <Column
      :showFilterMatchModes="false"
      field="system_chain"
      header="Systems"
      :sortable="true"
    >
      <template #filter>
        <label class="mt-2">Source System</label>
        <select
          v-model="tableFilters.system.source"
          class="form-control w-full"
        >
          <option selected disabled>Please select...</option>
          <option
            v-for="(system, idx) in filterOptions.systems"
            :key="idx"
            :value="system"
          >
            {{ system }}
          </option>
        </select>
        <label class="mt-2">Destination System</label>
        <select
          v-model="tableFilters.system.destination"
          class="form-control w-full"
        >
          <option selected disabled>Please select...</option>
          <option
            v-for="(system, idx) in filterOptions.systems"
            :key="idx"
            :value="system"
          >
            {{ system }}
          </option>
        </select>
      </template>
      <template #filterclear>
        <button
          type="button"
          @click="clearFilter('system_chain')"
          class="button button-secondary"
        >
          Clear
        </button>
      </template>
    </Column>
    <Column field="last_run_id" header="Sync ID" :sortable="true" />
    <Column field="common_ref" header="Reference" />
    <Column
      :showFilterMatchModes="false"
      field="created_at"
      header="Date/Time (UTC)"
    >
      <label class="mt-2">Previous Days</label>
      <template #filter>
        <input
          v-model="tableFilters.days.value"
          class="form-control w-full"
          type="number"
          min="1"
          max="15"
        />
      </template>
      <template #filterclear>
        <button
          type="button"
          @click="clearFilter('days')"
          class="button button-secondary"
        >
          Clear
        </button>
      </template>
    </Column>
    <Column
      field="local_time"
      :header="'(Date/Time ' + getAbbreviatedTimezone() + ')'"
    />
    <Column v-if="columnOptions.showActions" field="actions" header="Actions" />
    <Column
      v-if="showAdditionalSyncData"
      field="last_run_id"
      header="Latest Sync Information"
    />
    <div v-if="showAdditionalFields">
      <Column field="source_id" header="Source Id" />
      <Column field="source_parent_id" header="Source Parent Id" />
      <Column field="endpoint_id" header="Endpoint Id" />
      <Column field="endpoint_parent_id" header="Endpoint Parent Id" />
    </div>

    <template #groupfooter="{ data }">
      <template v-if="data.status === 'Failed'">
        <td></td>
        <td :colspan="colspan" class="px-3 py-2">
          <div class="w-full rounded bg-gray-100 px-3 py-1 text-right text-sm">
            <p>
              {{ data.message ? data.message : 'No failure message: ' }}
              <a
                @click="$emit('openFailedSyncDialogue', data)"
                class="cursor-pointer underline"
                >Error details</a
              >
            </p>
          </div>
        </td>
      </template>
    </template>
    <template #empty>No sync records found for the current filters</template>
  </DataTable>
</template>

<script>
import { dateHelperMixin } from '@/mixins/date-helper-mixin';
import { entitiesHelperMixin } from '@/mixins/entities-helper-mixin';

export default {
  name: 'SyncsTable',
  mixins: [dateHelperMixin, entitiesHelperMixin],
  props: {
    syncs: {
      type: Array,
      default: () => [],
    },
    selected: Array,
    searchTerm: String,
    showAdditionalSyncData: Boolean,
    loading: Boolean,
    filters: Object,
    filterOptions: Object,
    columnOptions: Object,
  },
  emits: [
    'update:selected',
    'update:searchTerm',
    'update:filters',
    'update:showAdditionalSyncData',
    'openFailedSyncDialogue',
    'launchDownloadCsv',
  ],
  mounted() {
    this.search = this.searchTerm;
    this.selectedRows = this.selected;
    this.tableFilters = this.mapFilters();
  },
  data() {
    return {
      additionalFilterOptions: [],
      search: '',
      selectedRows: [],
      tableFilters: {},
      timeout: null,
    };
  },
  computed: {
    colspan() {
      let colspan = 8;

      if (this.columnOptions.showActions) {
        colspan++;
      }
      if (this.showAdditionalFields) {
        colspan = colspan + 4;
      }
      if (this.showAdditionalSyncData) {
        colspan++;
      }
      return colspan;
    },
    showAdditionalFields() {
      if (
        this.additionalFilterOptions.find(
          (option) => option.value === 'AdditionalFields'
        )
      ) {
        return true;
      }

      return false;
    },
  },
  methods: {
    mapFilters() {
      this.tableFilters = {
        'integration.name': '', // required for filter atm...
        created_at: '', // required for filter atm...
        days: { value: this.filters.days },
        integrations: { value: this.filters.integrations },
        status: { value: this.filters.status },
        type: { value: this.filters.type },
        system: {
          source: this.tableFilters?.system?.source ?? '',
          destination: this.tableFilters?.system?.destination ?? '',
        },
        system_chain: { value: this.filters.system_chain },
        search_term: { value: this.filters.search_term },
      };
    },
    onFilter(filters) {
      for (const property in filters) {
        if (property === 'system_chain') {
          continue;
        }
        if (property === 'system') {
          if (filters.system.source && filters.system.destination) {
            this.filters.system_chain =
              filters.system.source + '_' + filters.system.destination;
          } else {
            this.filters.system_chain = '';
          }
        } else {
          this.filters[property] = filters[property].value;
        }
      }

      this.$emit('update:filters', this.filters);
    },
    onSort(event) {
      this.filters.sort_field = event.sortField;
      this.filters.sort_direction = event.sortOrder > 0 ? 'asc' : 'desc';

      this.$emit('update:filters', this.filters);
    },
    clearFilter(field) {
      switch (field) {
        case 'days':
          this.tableFilters.days.value = 5;
          break;
        case 'type':
          this.tableFilters.type.value = 'all';
          break;
        case 'system_chain':
          this.tableFilters.system.source = '';
          this.tableFilters.system.destination = '';
          break;
        default:
          this.tableFilters[field].value = null;
          break;
      }

      this.onFilter(this.tableFilters);
    },
  },
  watch: {
    filters: {
      handler() {
        this.mapFilters();
      },
      deep: true,
    },
    selectedRows(selected) {
      this.$emit('update:selected', selected);
    },
    search(search) {
      if (search.length > 3 || search.length === 0) {
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
          this.$emit('update:searchTerm', search);
        }, 500);
      }
    },
    additionalFilterOptions(options) {
      if (options.find((option) => option.value === 'AdditionalData')) {
        this.$emit('update:showAdditionalSyncData', true);
      } else {
        this.$emit('update:showAdditionalSyncData', false);
      }
    },
  },
};
</script>
