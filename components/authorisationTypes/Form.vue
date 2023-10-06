<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <form v-else @submit.prevent="saveAuthorisationType">
    <Modal id="deleteConfirmation" title="Are you sure?" classes="modal--small">
      <LegacyDeleteConfirmationModal
        warning-text="Please confirm that you want to remove this authorisation type."
        @deleteCancel="closeModal"
        @deleteConfirm="deleteAuthorisationType"
      />
    </Modal>
    <UiTitledCard title="General">
      <div class="mb-2">
        <label class="font-medium"> Name </label>
        <input
          v-model="authorisationTypeName"
          type="text"
          class="w-full"
          placeholder="Example: oAuth2"
          pattern="[a-zA-Z0-9 \-&\+_]+"
          title="Name must contain alphanumeric, ampersand, dash and space characters only."
          required
          :disabled="isMakingRequest"
        />
      </div>
    </UiTitledCard>
    <hr />
    <div
      class="flex justify-between flex-col-reverse md:flex-row gap-2"
    >
      <div class="flex justify-between gap-2">
        <button
          v-if="authorisationType"
          type="button"
          class="w-full button button-danger"
          :disabled="isMakingRequest"
          @click="openModal('deleteConfirmation')"
        >
          Delete Authorisation Type
        </button>
      </div>
      <div
        class="flex flex-col-reverse md:flex-row justify-between gap-2"
      >
        <button
          type="button"
          class="w-full button button-secondary"
          :disabled="isMakingRequest"
          @click="navigateTo({name: 'admin-manage-authorisation-types'})"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="w-full button button-primary lg:whitespace-nowrap"
          :disabled="isMakingRequest"
        >
          Save Authorisation Type
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'Form',
  props: {
    authorisationTypeId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      isMakingRequest: false,
      authorisationType: null,
      authorisationTypeName: null,
    };
  },
  async fetch() {
    if (this.authorisationTypeId) {
      this.authorisationType = await this.$axios
        .$get(`/api/api/v2/authorisation-types/${this.authorisationTypeId}`)
        .then(r => r.data);
      this.authorisationTypeName = this.authorisationType.name;
    }
  },
  computed: {
    authorisationTypePayload() {
      return {
        name: this.authorisationTypeName,
      };
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    async saveAuthorisationType() {
      this.isMakingRequest = true;
      try {
        if (this.authorisationType) {
          await this.$axios.$patch(
            `/api/v2/admin/authorisation-types/${this.authorisationTypeId}`,
            this.authorisationTypePayload
          );
        } else {
          await this.$axios.$post(
            '/api/v2/admin/authorisation-types',
            this.authorisationTypePayload
          );
        }
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved authorisation type',
          },
          4000
        );
        navigateTo({name: 'admin-manage-authorisation-types'});
      } catch (error) {
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed saving the authorisation type. Error: ${error}`,
          },
          4000
        );
      }
    },
    async deleteAuthorisationType() {
      try {
        this.isMakingRequest = true;
        await this.$axios.$delete(
          `/api/v2/admin/authorisation-types/${this.authorisationTypeId}`
        );
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully deleted authorisation type',
          },
          4000
        );
        navigateTo({name: 'admin-manage-authorisation-types'});
      } catch (error) {
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed deleting the authorisation type. Error: ${error}`,
          },
          4000
        );
      }
    },
  },
};
</script>
