<template>
  <UiLoading
    v-if="$fetchState.pending"
    class="w-full"
    label="Loading Data..."
  />
  <UiError
    v-else-if="$fetchState.error"
    message="An error occurred."
    class="relative h-36"
  />
  <form v-else @submit.prevent="saveFactorySystemServiceOption">
    <Modal id="deleteConfirmation" title="Are you sure?" classes="modal--small">
      <LegacyDeleteConfirmationModal
        warning-text="Please confirm that you want to remove this factory system service option."
        @deleteCancel="closeModal"
        @deleteConfirm="deleteFactorySystemServiceOption"
      />
    </Modal>
    <div>
      <UiTitledCard title="Option">
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
            name="option-search"
            id="option-search"
            autocomplete="option-search"
            class="block w-full rounded-md pl-10"
            placeholder="Search for your option..."
            v-model="optionSearchValue"
            :disabled="makingRequest || displayOptionCreator"
          />
        </div>

        <template v-if="!displayOptionCreator">
          <FormElement
            v-model="payload.service_option_id"
            title="service_option_id"
            label="Option"
            :errors="errors"
            :disabled="makingRequest"
            required
            v-slot="{ inputProps, inputEvents }"
          >
            <select class="w-full" v-bind="inputProps" v-on="inputEvents">
              <option value="please_select" disabled>Please select</option>
              <option
                v-for="serviceOption in filteredServiceOptions"
                :key="serviceOption.id"
                :value="serviceOption.id"
              >
                {{ serviceOption.key }}
              </option>
            </select>
          </FormElement>

          <button
            type="button"
            class="button button-secondary"
            @click="showOptionCreator"
          >
            Can't find your option? Click here to create a new one
          </button>
        </template>

        <template v-else>
          <FormElement
            v-model="optionPayload.key"
            v-slot="{ inputProps, inputEvents }"
            title="option_key"
            label="Option"
            :errors="errors"
            required
            :disabled="makingRequest"
          >
            <input
              type="text"
              placeholder="Please enter a value."
              min="1"
              class="w-full"
              v-bind="inputProps"
              v-on="inputEvents"
            />
          </FormElement>

          <button
            type="button"
            class="button button-secondary"
            @click="showOptionCreator"
          >
            Go back to dropdown
          </button>
        </template>
      </UiTitledCard>

      <hr />

      <UiTitledCard title="General">
        <FormElement
          v-model="payload.value"
          v-slot="{ inputProps, inputEvents }"
          title="value"
          label="Value"
          :errors="errors"
          :disabled="makingRequest"
          required
        >
          <input
            type="text"
            placeholder="Please enter a value."
            min="1"
            class="w-full"
            v-bind="inputProps"
            v-on="inputEvents"
          />
        </FormElement>

        <FormElement
          title="user_configurable"
          label="User Configurable"
          :errors="errors"
          :disabled="makingRequest"
          required
        >
          <div class="space-y-2">
            <div class="flex items-center gap-x-2 text-sm">
              <input
                v-model="payload.user_configurable"
                type="radio"
                :value="true"
                name="userConfigurable"
              />
              <span>Yes</span>
            </div>
            <div class="flex items-center gap-x-2 text-sm">
              <input
                v-model="payload.user_configurable"
                type="radio"
                :value="false"
                name="userConfigurable"
              />
              <span>No</span>
            </div>
          </div>
        </FormElement>

        <FormElement
          v-model="payload.value_type"
          title="value_type"
          label="Value Type"
          :errors="errors"
          :disabled="makingRequest"
          required
          v-slot="{ inputProps, inputEvents }"
        >
          <select class="w-full" v-bind="inputProps" v-on="inputEvents">
            <option value="string">String</option>
            <option value="integer">Integer</option>
            <option value="boolean">Boolean</option>
            <option value="float">Float</option>
          </select>
        </FormElement>

        <FormElement
          title="needs_properties"
          label="Is this option multiple choice?"
          :errors="errors"
          :disabled="makingRequest"
          required
        >
          <div class="space-y-2">
            <div class="flex items-center gap-x-2 text-sm">
              <input
                v-model="needsProperties"
                type="radio"
                :value="true"
                name="needsProperties"
                @change="addOrRemoveProperties"
              />
              <span>Yes</span>
            </div>
            <div class="flex items-center gap-x-2 text-sm">
              <input
                v-model="needsProperties"
                type="radio"
                :value="false"
                name="needsProperties"
                @change="addOrRemoveProperties"
              />
              <span>No</span>
            </div>
          </div>
        </FormElement>

        <FormElement
          v-if="needsProperties"
          title="options"
          label="Options"
          :errors="errors"
          required
        >
          <Chips
            v-model="payload.properties.options"
            class="w-full"
            separator=","
          />
        </FormElement>
      </UiTitledCard>
    </div>
    <hr />
    <div class="flex justify-between">
      <div>
        <button
          v-if="factorySystemServiceOptionId"
          type="button"
          class="button button-danger"
          :disabled="makingRequest"
          @click="openModal('deleteConfirmation')"
        >
          Delete Factory System Service Option
        </button>
      </div>
      <UiLoading v-if="makingRequest" label="Saving option..." />
      <div>
        <button
          type="button"
          class="button button-secondary mr-1"
          :disabled="makingRequest"
          @click="
            navigateTo({
              name: 'admin-manage-systems-systemId-manage-factory-systems-factorySystemId',
              params: { systemId: systemId, factorySystemId: factorySystemId },
            })
          "
        >
          Cancel
        </button>
        <button
          v-if="!factorySystemServiceOptionId"
          type="submit"
          class="button button-primary mr-1"
          :disabled="makingRequest || !isValidServiceOption"
          @click="toggleProperty('addNewUponSave')"
        >
          Save and add another
        </button>
        <button
          type="submit"
          class="button button-primary"
          :disabled="makingRequest || !isValidServiceOption"
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
  name: 'FactorySystemServiceOptionForm',
  props: {
    systemId: {
      type: Number,
      required: true,
    },
    factorySystemId: {
      type: Number,
      required: true,
    },
    factorySystemServiceOptionId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      factorySystemServiceOption: null,
      makingRequest: false,
      serviceOptions: [],
      optionSearchValue: '',
      displayOptionCreator: false,
      optionPayload: {
        key: null,
      },
      payload: {
        service_option_id: 'please_select',
        value: null,
        user_configurable: false,
        value_type: 'string',
        properties: null,
      },
      addNewUponSave: false,
      needsProperties: false,
      errors: {},
    };
  },
  async fetch() {
    await this.getServiceOptions();
    if (this.factorySystemServiceOptionId) {
      this.factorySystemServiceOption = await this.$axios
        .$get(
          `/api/api/v2/factory-systems/${this.factorySystemId}/factory-system-service-options/${this.factorySystemServiceOptionId}?include=serviceOption`
        )
        .then((r) => r.data);
      this.payload.service_option_id =
        this.factorySystemServiceOption.service_option.id;
      this.optionPayload.key =
        this.factorySystemServiceOption.service_option.key;
      this.payload.value = this.factorySystemServiceOption.value;
      this.payload.user_configurable =
        this.factorySystemServiceOption.user_configurable;
      this.payload.properties = this.factorySystemServiceOption.properties;
      if (this.payload.properties) {
        this.needsProperties = true;
      }
    }
  },
  computed: {
    filteredServiceOptions() {
      if (!this.serviceOptions.length) {
        return [];
      }
      return this.serviceOptions.filter((serviceOption) =>
        serviceOption.key.includes(this.optionSearchValue)
      );
    },
    isValidServiceOption() {
      return this.displayOptionCreator === false
        ? this.payload.service_option_id !== 'please_select'
        : this.optionPayload.key !== null;
    },
    isExistingKey() {
      if (!this.factorySystemServiceOption) {
        return false;
      }

      return (
        this.optionPayload.key ===
        this.factorySystemServiceOption.service_option.key
      );
    },
    existingOption() {
      return this.serviceOptions.find(
        (serviceOption) => serviceOption.key === this.optionPayload.key
      );
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    showOptionCreator() {
      this.optionPayload.key = null;
      this.displayOptionCreator = !this.displayOptionCreator;
    },
    addOrRemoveProperties() {
      if (this.needsProperties) {
        this.payload.properties = {
          type: 'select',
          options: [],
        };
      } else {
        this.payload.properties = null;
      }
    },
    async getServiceOptions() {
      try {
        this.serviceOptions = await fetchAllPaginatedResults(
          this.$axios,
          '/api/api/v2/service-options',
          { perPage: 100 }
        );
      } catch (error) {
        console.log(error);

        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to get service options`,
          },
          4000
        );
      }
    },
    toggleProperty(propertyName) {
      this[propertyName] = !this[propertyName];
    },
    async saveFactorySystemServiceOption() {
      this.makingRequest = true;
      try {
        if (this.optionPayload.key) {
          this.payload.service_option_id = await this.getServiceOptionId();
        }

        if (this.factorySystemServiceOptionId) {
          await this.updateFactorySystemServiceOption();

          this.$notify(
            {
              group: 'notifications',
              type: 'success',
              text: 'Successfully saved factory system service option',
            },
            4000
          );

          navigateTo({
            name: 'admin-manage-systems-systemId-manage-factory-systems-factorySystemId',
            params: {
              systemId: this.systemId,
              factorySystemId: this.factorySystemId,
            },
          });

          return;
        }

        await this.createFactorySystemServiceOption();
        if (this.addNewUponSave) {
          this.$router.go();
        } else {
          navigateTo({
            name: 'admin-manage-systems-systemId-manage-factory-systems-factorySystemId',
            params: {
              systemId: this.systemId,
              factorySystemId: this.factorySystemId,
            },
          });
        }

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved factory system service option',
          },
          4000
        );
      } catch (error) {
        console.log(error);

        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: 'Failed to save factory system service option',
          },
          4000
        );
      } finally {
        this.makingRequest = false;
      }
    },
    async getServiceOptionId() {
      if (this.isExistingKey && this.existingOption) {
        return this.existingOption.id;
      }

      return await this.createServiceOption();
    },
    async createServiceOption() {
      return await this.$axios
        .$post('/api/api/v2/admin/service-options', this.optionPayload)
        .then((r) => r.data);
    },
    async createFactorySystemServiceOption() {
      await this.$axios
        .$post(
          `/api/api/v2/admin/factory-systems/${this.factorySystemId}/factory-system-service-options`,
          this.payload
        )
        .then((r) => r.data);
    },
    async updateFactorySystemServiceOption() {
      await this.$axios.$patch(
        `/api/api/v2/admin/factory-systems/${this.factorySystemId}/factory-system-service-options/${this.factorySystemServiceOptionId}`,
        this.payload
      );
    },
    async deleteFactorySystemServiceOption() {
      this.closeModal();
      this.makingRequest = true;
      try {
        await this.$axios.$delete(
          `/api/api/v2/admin/factory-systems/${this.factorySystemId}/factory-system-service-options/${this.factorySystemServiceOptionId}`
        );
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully deleted factory system service option',
          },
          4000
        );
        navigateTo({
          name: 'admin-manage-systems-systemId-manage-factory-systems-factorySystemId',
          params: {
            systemId: this.systemId,
            factorySystemId: this.factorySystemId,
          },
        });
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to delete factory system service option: ${error}`,
          },
          4000
        );
      } finally {
        this.makingRequest = false;
      }
    },
  },
};
</script>
