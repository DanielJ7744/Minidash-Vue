<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <form v-else @submit.prevent="saveEntity">
    <Modal id="deleteConfirmation" title="Are you sure?" classes="modal--small">
      <ModalConfirmDeletion
        warning-text="Please confirm that you want to remove this entity."
        @deleteCancel="closeModal"
        @deleteConfirm="deleteEntity"
      />
    </Modal>
    <UiTitledCard title="General">
      <div class="mb-2">
        <label class="font-medium"> Name </label>
        <input
          v-model="entityName"
          type="text"
          class="w-full"
          placeholder="Example: Stock"
          pattern="[a-zA-Z0-9 \-&\+_]+"
          title="Name must contain alphanumeric, ampersand, dash and space characters only."
          required
          :disabled="isMakingRequest"
        />
      </div>
      <div class="mb-2">
        <label class="font-medium"> Integration ID </label>
        <input
          type="text"
          class="w-full"
          disabled
          :value="integrationToDisplay"
        />
      </div>
    </UiTitledCard>
    <hr />
    <div
      class="flex justify-between flex-col-reverse md:flex-row gap-2"
    >
      <div class="flex justify-between gap-2">
        <button
          v-if="entity"
          type="button"
          class="w-full button button-danger"
          :disabled="isMakingRequest"
          @click="openModal('deleteConfirmation')"
        >
          Delete Entity
        </button>
      </div>
      <div
        class="flex flex-col-reverse md:flex-row justify-between gap-2"
      >
        <button
          type="button"
          class="w-full button button-secondary"
          :disabled="isMakingRequest"
          @click="navigateTo({name: 'admin-manage-entities'})"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="w-full button button-primary lg:whitespace-nowrap"
          :disabled="isMakingRequest"
        >
          Save Entity
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'EntityForm',
  props: {
    entityId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      isMakingRequest: false,
      entity: null,
      entityName: null,
      entityIntegrationId: null,
    };
  },
  async fetch() {
    if (this.entityId) {
      this.entity = await this.$axios
        .$get(`/api/api/v2/admin/entities/${this.entityId}`)
        .then(r => r.data);
      this.entityName = this.entity.name;
      this.entityIntegrationId = this.entity.integration_id;
    }
  },
  computed: {
    entityPayload() {
      return {
        name: this.entityName,
        integration_id: this.entityIntegrationId,
      };
    },
    integrationToDisplay() {
      return this.entityIntegrationId === null
        ? 'Global'
        : this.entityIntegrationId;
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    async saveEntity() {
      this.isMakingRequest = true;
      try {
        if (this.entity) {
          await this.$axios.$patch(
            `/api/api/v2/admin/entities/${this.entityId}`,
            this.entityPayload
          );
        } else {
          await this.$axios.$post(
            '/api/api/v2/admin/entities',
            this.entityPayload
          );
        }
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved entity',
          },
          4000
        );
        navigateTo({name: 'admin-manage-entities'});
      } catch (error) {
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed saving the entity. Error: ${error}`,
          },
          4000
        );
      }
    },
    async deleteEntity() {
      try {
        this.isMakingRequest = true;
        await this.$axios.$delete(
          `/api/api/v2/admin/entities/${this.entityId}`
        );
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully deleted entity',
          },
          4000
        );
        navigateTo({name: 'admin-manage-entities'});
      } catch (error) {
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed deleting the entity. Error: ${error}`,
          },
          4000
        );
      }
    },
  },
};
</script>
