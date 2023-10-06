<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <form v-else @submit.prevent="saveFactorySystem">
    <Modal id="deleteConfirmation" title="Are you sure?" classes="modal--small">
      <LegacyDeleteConfirmationModal
        warning-text="Please confirm that you want to remove this factory system."
        @deleteCancel="closeModal"
        @deleteConfirm="deleteFactorySystem"
      />
    </Modal>
    <UiTitledCard title="General">
      <div>
        <label> Entity </label>
        <select
          v-model="selectedEntity"
          class="w-full"
          required
          :disabled="makingRequest"
        >
          <option
            v-for="entity in entities"
            :key="entity.id"
            :value="entity.id"
          >
            {{ entity.name }}
          </option>
        </select>
      </div>
      <div>
        <label> Factory </label>
        <select
          v-model="selectedFactory"
          class="w-full"
          required
          :disabled="makingRequest"
        >
          <option
            v-for="factory in factories"
            :key="factory.id"
            :value="factory.id"
          >
            {{ factory.name }}
          </option>
        </select>
      </div>
      <div>
        <label> Direction </label>
        <select
          v-model="selectedDirection"
          class="w-full"
          required
          :disabled="makingRequest"
        >
          <option value="pull">Pull</option>
          <option value="push">Push</option>
        </select>
      </div>
      <div>
        <label> Display Name </label>
        <input
          v-model="displayName"
          type="text"
          placeholder="Please enter a display name."
          required
          min="3"
          max="255"
          pattern="[a-zA-Z0-9 ]+$"
          title="Name must contain alphabetical and space characters only."
          class="w-full"
        />
      </div>
    </UiTitledCard>
    <template v-if="factorySystem">
      <hr />
      <UiTitledCard title="Options">
        <template #content>
          <TableFactorySystemServiceOptions
            :system-id="systemId"
            :factory-system-id="factorySystemId"
          />
        </template>
      </UiTitledCard>
    </template>
    <hr />
    <div class="flex flex-col-reverse justify-between gap-2 md:flex-row">
      <div class="flex justify-between gap-2">
        <button
          v-if="factorySystem"
          type="button"
          class="button button-danger w-full"
          :disabled="makingRequest"
          @click="openModal('deleteConfirmation')"
        >
          Delete Factory System
        </button>
      </div>
      <div class="flex flex-col-reverse justify-between gap-2 md:flex-row">
        <button
          type="button"
          class="button button-secondary w-full"
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
          type="submit"
          class="button button-primary w-full lg:whitespace-nowrap"
          :disabled="makingRequest"
        >
          Save Factory System
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'FactorySystemsFormForm',
  props: {
    factorySystemId: {
      type: Number,
      required: false,
      default: null,
    },
    systemId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      makingRequest: false,
      factorySystem: null,
      factories: [],
      entities: [],
      selectedEntity: null,
      selectedFactory: null,
      selectedDirection: null,
      displayName: null,
    };
  },
  async fetch() {
    if (this.factorySystemId) {
      this.factorySystem = await this.$axios
        .$get(
          `/api/api/v2/factory-systems/${this.factorySystemId}?include=serviceFactory,system,entity`
        )
        .then((r) => r.data);
      this.selectedEntity = this.factorySystem.entity.id;
      this.selectedFactory = this.factorySystem.service_factory.id;
      this.selectedDirection = this.factorySystem.direction;
      if (this.factorySystem.display_name) {
        this.displayName = this.factorySystem.display_name;
      }
    }
    this.entities = await this.$axios
      .$get('/api/api/v2/entities')
      .then((r) => r.data);
    this.factories = await fetchAllPaginatedResults(
      this.$axios,
      '/api/api/v2/factories',
      { perPage: 100 }
    );
  },
  computed: {
    factorySystemPayload() {
      return {
        system_id: parseInt(this.systemId),
        entity_id: parseInt(this.selectedEntity),
        factory_id: parseInt(this.selectedFactory),
        direction: this.selectedDirection,
        display_name: this.displayName,
      };
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    async deleteFactorySystem() {
      try {
        this.makingRequest = true;
        await this.$axios.$delete(
          `/api/api/v2/admin/factory-systems/${this.factorySystemId}`
        );
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully deleted factory system',
          },
          4000
        );
        navigateTo({
          name: 'admin-manage-systems-systemId',
          params: {
            systemId: this.systemId,
          },
        });
        this.makingRequest = false;
      } catch (error) {
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed deleting the factory system. Error: ${error}`,
          },
          4000
        );
      }
    },
    async saveFactorySystem() {
      try {
        this.makingRequest = true;
        if (this.factorySystem) {
          await this.$axios.$patch(
            `/api/api/v2/admin/factory-systems/${this.factorySystemId}`,
            this.factorySystemPayload
          );
        } else {
          await this.$axios.$post(
            '/api/api/v2/admin/factory-systems',
            this.factorySystemPayload
          );
        }
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved factory system',
          },
          4000
        );
        navigateTo({
          name: 'admin-manage-systems-systemId',
          params: {
            systemId: this.systemId,
          },
        });
        this.makingRequest = false;
      } catch (error) {
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed saving the factory system. Error: ${error}`,
          },
          4000
        );
      }
    },
  },
};
</script>
