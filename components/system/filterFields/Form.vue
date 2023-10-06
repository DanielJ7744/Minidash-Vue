<template>
  <UiLoading
    v-if="$fetchState.pending"
    class="w-full"
    label="Loading Data..."
  />
  <div v-else-if="$fetchState.error" class="relative h-36">
    <UiError message="An error occurred." />
  </div>
  <form v-else @submit.prevent="saveFilterField">
    <Modal id="deleteConfirmation" title="Are you sure?" classes="modal--small">
      <LegacyDeleteConfirmationModal
        warning-text="Please confirm that you want to remove this filter field."
        @deleteCancel="closeModal"
        @deleteConfirm="deleteFilterField"
      />
    </Modal>
    <div>
      <UiTitledCard title="General">
        <div>
          <label class="mb-1 font-medium"> Name </label>
          <input
            v-model="payload.name"
            type="text"
            placeholder="Please enter a name."
            required
            min="3"
            max="255"
            pattern="[a-zA-Z0-9 \-&[\]\+_]+"
            title="Name must contain alphanumeric, ampersand, dash and space characters only."
            class="w-full"
          />
        </div>
        <div>
          <label class="mb-1 font-medium"> Key </label>
          <input
            v-model="payload.key"
            type="text"
            placeholder="Please enter a key. A key looks like: created_at_min"
            required
            min="3"
            max="255"
            pattern="[a-zA-Z0-9 \-&[\]\+_]+"
            title="Name must contain alphanumeric, ampersand, dash and space characters only."
            class="w-full"
          />
        </div>
        <div>
          <label class="mb-1 font-medium">
            Filter Types - At least one must be selected
          </label>
          <div class="grid items-center grid-cols-3">
            <div
              v-for="filterType in filterTypes"
              :key="filterType.id + 'filterType'"
              class="flex items-center gap-x-1"
            >
              <input
                :id="filterType.id"
                v-model="checkedFilterTypes"
                type="checkbox"
                :value="filterType.id"
              />
              <label :for="filterType.id"
                >{{ filterType.key }} ({{ filterType.name }})</label
              >
            </div>
          </div>
        </div>
        <div>
          <label class="mb-1 font-medium">
            Filter Operators (Optional: Each filter type has a default operator.
            Only add one of the below if you need a specific operator to be
            available)
          </label>
          <div class="grid items-center grid-cols-3">
            <div
              v-for="filterOperator in filterOperators"
              :key="filterOperator.id + 'filterOperator'"
              class="flex items-center gap-x-1"
            >
              <input
                :id="filterOperator.id"
                v-model="checkedFilterOperators"
                type="checkbox"
                :value="filterOperator.id"
              />
              <label :for="filterOperator.id"
                >{{ filterOperator.name }} ({{ filterOperator.key }})</label
              >
            </div>
          </div>
        </div>
      </UiTitledCard>
      <hr />
      <UiTitledCard title="Factory System">
        <div>
          <label class="mb-1 font-medium"> Factory System </label>
          <select
            v-model="payload.factory_system_id"
            class="w-full"
            required
          >
            <option value="please_select" disabled>Please select</option>
            <option
              v-for="factorySystem in factorySystems"
              :key="factorySystem.id + 'factorySystem'"
              :value="factorySystem.id"
            >
              {{ factorySystem.direction }} {{ factorySystem.entity.name }} /
              {{ factorySystem.service_factory.name }}
            </option>
          </select>
        </div>
      </UiTitledCard>
      <hr />
      <UiTitledCard title="Default Values">
        <div>
          <label class="mb-1 font-medium"> Default </label>
          <div class="flex items-center gap-x-5">
            <div class="flex items-center">
              <input
                v-model="payload.default"
                type="radio"
                :value="true"
                name="isDefault"
                required
              />
              <label>Yes</label>
            </div>
            <div class="flex items-center">
              <input
                v-model="payload.default"
                type="radio"
                :value="false"
                name="isDefault"
                required
              />
              <label>No</label>
            </div>
          </div>
        </div>
        <div>
          <label class="mb-1 font-medium"> Default Value </label>
          <input
            v-model="payload.default_value"
            type="text"
            placeholder="Please enter a default value."
            required
            class="w-full"
          />
        </div>
        <div>
          <label class="mb-1 font-medium"> Default Type </label>
          <select v-model="payload.default_type_id" class="w-full" required>
            <option value="please_select" disabled>Please select</option>
            <option
              v-for="filterType in filterTypes"
              :key="filterType.id + 'defaultFilterType'"
              :value="filterType.id"
            >
              {{ filterType.key }} ({{ filterType.name }})
            </option>
          </select>
        </div>
        <div>
          <label class="mb-1 font-medium"> Default Operator </label>
          <select
            v-model="payload.default_operator_id"
            class="w-full"
            required
          >
            <option value="please_select" disabled>Please select</option>
            <option
              v-for="filterOperator in filterOperators"
              :key="filterOperator.id + 'defaultFilterOperator'"
              :value="filterOperator.id"
            >
              {{ filterOperator.name }} ({{ filterOperator.key }})
            </option>
          </select>
        </div>
      </UiTitledCard>
    </div>
    <hr />
    <div class="flex justify-between">
      <div>
        <button
          v-if="filterFieldId"
          type="button"
          class="button button-danger"
          :disabled="makingRequest"
          @click="openModal('deleteConfirmation')"
        >
          Delete filter field
        </button>
      </div>
      <div v-if="makingRequest">
        <UiLoading label="Saving filter field..." />
      </div>
      <div>
        <button
          type="button"
          class="mr-1 button button-secondary"
          :disabled="makingRequest"
          @click="
            navigateTo({
              name: 'admin-manage-systems-systemId',
              params: { systemId },
            })
          "
        >
          Cancel
        </button>
        <button
          v-if="!filterFieldId"
          type="submit"
          class="mr-1 button button-primary"
          :disabled="makingRequest || needsFilterType"
          @click="toggleProperty('addNewUponSave')"
        >
          Save and add another
        </button>
        <button
          type="submit"
          class="button button-primary"
          :disabled="makingRequest || needsFilterType"
        >
          Save
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'FilterFieldForm',
  props: {
    systemId: {
      type: Number,
      required: true,
    },
    filterFieldId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      filterField: null,
      factorySystems: [],
      filterOperators: [],
      filterTypes: [],
      makingRequest: false,
      payload: {
        name: null,
        key: null,
        factory_system_id: 'please_select',
        default: false,
        default_value: null,
        default_type_id: 'please_select',
        default_operator_id: 'please_select',
      },
      addNewUponSave: false,
      initialFilterTypes: [],
      initialFilterOperators: [],
      checkedFilterTypes: [],
      checkedFilterOperators: [],
    };
  },
  async fetch() {
    await Promise.allSettled([
      this.getPaginatedData(1, this.factorySystemsUrl, 'factorySystems'),
      this.getPaginatedData(1, this.filterOperatorUrl, 'filterOperators'),
      this.getPaginatedData(1, this.filterTypeUrl, 'filterTypes'),
    ]);
    if (this.filterFieldId) {
      this.filterField = await this.$axios
        .$get(
          `/api/api/v2/filter-fields/${this.filterFieldId}?include=filterType,filterOperator`
        )
        .then((r) => r.data);
      const filterTypes = this.filterField.filter_types.map(
        (filterType) => filterType.id
      );
      const filterOperators = this.filterField.filter_operators.map(
        (filterOperator) => filterOperator.id
      );
      this.checkedFilterTypes = filterTypes;
      this.initialFilterTypes = filterTypes;
      this.checkedFilterOperators = filterOperators;
      this.initialFilterOperators = filterOperators;
      this.payload.name = this.filterField.name;
      this.payload.key = this.filterField.key;
      this.payload.factory_system_id = this.filterField.factory_system_id;
      this.payload.default = this.filterField.default;
      this.payload.default_value = this.filterField.default_value;
      this.payload.default_type_id = this.filterField.default_type_id;
      this.payload.default_operator_id = this.filterField.default_operator_id;
    }
  },
  computed: {
    factorySystemsUrl() {
      return `factory-systems?filter[system_id]=${this.systemId}&include=serviceFactory,entity`;
    },
    filterOperatorUrl() {
      return 'filter-operators?perPage=50';
    },
    filterTypeUrl() {
      return 'filter-types?perPage=50';
    },
    needsFilterType() {
      return !this.checkedFilterTypes.length;
    },
    filterTypesToRemove() {
      return this.initialFilterTypes.filter(
        (initialFilterType) =>
          !this.checkedFilterTypes.includes(initialFilterType)
      );
    },
    filterOperatorsToRemove() {
      return this.initialFilterOperators.filter(
        (initialFilterOperator) =>
          !this.checkedFilterOperators.includes(initialFilterOperator)
      );
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    async getPaginatedData(pageNumber, url, dataType) {
      try {
        const response = await this.$axios.$get(
          `/api/api/v2/${url}&page=${pageNumber}`
        );
        this[dataType] = this[dataType].concat(response.data);
        if (response.meta.last_page > pageNumber) {
          const nextPage = pageNumber + 1;
          await this.getPaginatedData(nextPage, url, dataType);
        }
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to get data: ${error}`,
          },
          4000
        );
      }
    },
    toggleProperty(propertyName) {
      this[propertyName] = !this[propertyName];
    },
    async saveFilterField() {
      if (this.needsFilterType) {
        return;
      }
      this.makingRequest = true;
      this.filterFieldId
        ? await this.updateFilterField()
        : await this.createFilterField();
      await this.removeAndAttachFilterData();
      if (this.addNewUponSave) {
        this.$router.go();
      } else {
        navigateTo({
          name: 'admin-manage-systems-systemId',
          params: {
            systemId: this.systemId,
          },
        });
      }
    },
    async createFilterField() {
      try {
        this.filterField = await this.$axios
          .$post('/api/api/v2/admin/filter-fields', this.payload)
          .then((r) => r.data);
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved service template option',
          },
          4000
        );
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to save service filter field: ${error}`,
          },
          4000
        );
        this.makingRequest = false;
      }
    },
    async updateFilterField() {
      try {
        this.filterField = await this.$axios
          .$patch(
            `/api/api/v2/admin/filter-fields/${this.filterFieldId}`,
            this.payload
          )
          .then((r) => r.data);
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved filter field',
          },
          4000
        );
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to update filter field: ${error}`,
          },
          4000
        );
        this.makingRequest = false;
      }
    },
    async deleteFilterField() {
      try {
        await this.$axios.$delete(
          `/api/api/v2/admin/filter-fields/${this.filterFieldId}`
        );
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully deleted filter field',
          },
          4000
        );
        navigateTo({
          name: 'admin-manage-systems-systemId',
          params: {
            systemId: this.systemId,
          },
        });
        this.closeModal();
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to delete filter field: ${error}`,
          },
          4000
        );
        this.makingRequest = false;
        this.closeModal();
      }
    },
    async removeAndAttachFilterData() {
      const removePromises = [];
      if (this.filterTypesToRemove.length) {
        this.filterTypesToRemove.forEach((filterType) => {
          removePromises.push(this.removeFilterType(filterType));
        });
      }
      if (this.filterOperatorsToRemove.length) {
        this.filterOperatorsToRemove.forEach((filterOperator) => {
          removePromises.push(this.removeFilterOperator(filterOperator));
        });
      }

      await Promise.allSettled(removePromises);

      const attachPromises = [];
      if (this.checkedFilterTypes.length) {
        this.checkedFilterTypes.forEach((filterType) => {
          attachPromises.push(this.attachFilterType(filterType));
        });
      }

      if (this.checkedFilterOperators.length) {
        this.checkedFilterOperators.forEach((filterOperator) => {
          attachPromises.push(this.attachFilterOperator(filterOperator));
        });
      }

      await Promise.allSettled(attachPromises);
    },
    attachFilterType(filterTypeId) {
      return this.$axios.$put(
        `/api/api/v2/admin/filter-fields/${this.filterField.id}/types/${filterTypeId}`
      );
    },
    removeFilterType(filterTypeId) {
      return this.$axios.$delete(
        `/api/api/v2/admin/filter-fields/${this.filterField.id}/types/${filterTypeId}`
      );
    },
    attachFilterOperator(filterOperatorId) {
      return this.$axios.$put(
        `/api/api/v2/admin/filter-fields/${this.filterField.id}/operators/${filterOperatorId}`
      );
    },
    removeFilterOperator(filterOperatorId) {
      return this.$axios.$delete(
        `/api/api/v2/admin/filter-fields/${this.filterField.id}/operators/${filterOperatorId}`
      );
    },
  },
};
</script>
