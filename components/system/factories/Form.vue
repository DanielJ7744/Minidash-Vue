<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />

  <form v-else @submit.prevent="saveFactory">
    <FormElement
      v-model="factoryName"
      title="name"
      label="Name"
      :disabled="isMakingRequest"
      required
      v-slot="{ inputProps, inputEvents }"
    >
      <input
        v-bind="inputProps"
        v-on="inputEvents"
        type="text"
        placeholder="Example: Stock"
        pattern="[a-zA-Z0-9 \-&\+_]+"
        title="Name must contain alphanumeric, ampersand, dash and space characters only."
      />
    </FormElement>

    <hr />

    <div
      class="flex justify-between flex-col-reverse md:flex-row gap-2"
    >
      <div class="flex justify-between gap-2">
        <button
          v-if="factory"
          type="button"
          class="w-full button button-danger"
          :disabled="isMakingRequest"
          @click="openModal('deleteConfirmation')"
        >
          Delete
        </button>
      </div>
      <div
        class="flex flex-col-reverse md:flex-row justify-between gap-2"
      >
        <button
          type="submit"
          class="w-full button button-primary lg:whitespace-nowrap"
          :disabled="isMakingRequest"
        >
          Save
        </button>
      </div>
    </div>

    <Modal id="deleteConfirmation" title="Are you sure?" classes="modal--small">
      <ModalConfirmDeletion
        warning-text="Please confirm that you want to remove this factory."
        @deleteCancel="closeModal"
        @deleteConfirm="deleteFactory"
      />
    </Modal>
  </form>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'FactoryForm',
  props: {
    factoryId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      isMakingRequest: false,
      factory: null,
      factoryName: null,
    };
  },
  async fetch() {
    if (this.factoryId) {
      this.factory = await this.$axios
        .$get(`/api/api/v2/factories/${this.factoryId}`)
        .then(r => r.data);
      this.factoryName = this.factory.name;
    }
  },
  computed: {
    factoryPayload() {
      return {
        name: this.factoryName,
      };
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    async saveFactory() {
      this.isMakingRequest = true;
      try {
        if (this.factory) {
          await this.$axios.$patch(
            `/api/api/v2/admin/factories/${this.factoryId}`,
            this.factoryPayload
          );
        } else {
          await this.$axios.$post(
            '/api/api/v2/admin/factories',
            this.factoryPayload
          );
        }
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved factory',
          },
          4000
        );
        navigateTo({name: 'admin-manage-factories'});
      } catch (error) {
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed saving the factory. Error: ${error}`,
          },
          4000
        );
      }
    },
    async deleteFactory() {
      try {
        this.isMakingRequest = true;
        await this.$axios.$delete(
          `/api/api/v2/admin/factories/${this.factoryId}`
        );
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully deleted factory',
          },
          4000
        );
        navigateTo({name: 'admin-manage-factories'});
      } catch (error) {
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed deleting the factory. Error: ${error}`,
          },
          4000
        );
      }
    },
  },
};
</script>
