<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <form v-else @submit.prevent="saveSystemType">
    <Modal id="deleteConfirmation" title="Are you sure?" classes="modal--small">
      <ModalConfirmDeletion
        warning-text="Please confirm that you want to remove this system type."
        @deleteCancel="closeModal"
        @deleteConfirm="deleteSystemType"
      />
    </Modal>
    <UiTitledCard title="General">
      <div class="mb-2">
        <label class="font-medium"> Name </label>
        <input
          v-model="systemTypeName"
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
        <label class="font-medium"> Active </label>
        <select
          v-model="systemTypeActive"
          class="w-full"
          :disabled="isMakingRequest"
        >
          <option :value="true">Yes</option>
          <option :value="false">No</option>
        </select>
      </div>
    </UiTitledCard>
    <hr />
    <template v-if="systemType && systemType.systems">
      <UiTitledCard title="Systems using type">
        <div class="max-h-80 overflow-y-auto">
          <div
            v-for="system in systemType.systems"
            :key="`systemList${system.id}`"
            class="flex items-center gap-2 mb-2 cursor-pointer"
            @click="navigateTo({name: 'admin-manage-systems-systemId', params: {systemId}})"
          >
            <div class="col-span-1 w-16 flex-shrink-0">
              <img
                :src="getLogoImage(system.name)"
                alt="System Logo"
                class="w-16 rounded"
              />
            </div>
            <div class="flex-grow">
              <h6 class="mb-2">
                {{ system.name }}
              </h6>
            </div>
          </div>
        </div>
      </UiTitledCard>
    </template>
    <div
      class="flex justify-between flex-col-reverse md:flex-row gap-2"
    >
      <div class="flex justify-between gap-2">
        <button
          v-if="systemType && canDeleteSystemType"
          type="button"
          class="w-full button button-danger"
          :disabled="isMakingRequest"
          @click="openModal('deleteConfirmation')"
        >
          Delete System Type
        </button>
      </div>
      <div
        class="flex flex-col-reverse md:flex-row justify-between gap-2"
      >
        <button
          type="button"
          class="w-full button button-secondary"
          :disabled="isMakingRequest"
          @click="navigateTo({name: 'admin-manage-system-types'})"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="w-full button button-primary lg:whitespace-nowrap"
          :disabled="isMakingRequest"
        >
          Save System Type
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'SystemTypeForm',
  props: {
    systemTypeId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      isMakingRequest: false,
      systemType: null,
      systemTypeName: null,
      systemTypeActive: false,
    };
  },
  async fetch() {
    if (this.systemTypeId) {
      this.systemType = await this.$axios
        .$get(`/api/api/v2/system-types/${this.systemTypeId}?include=systems`)
        .then(r => r.data);
      this.systemTypeName = this.systemType.name;
      this.systemTypeActive = this.systemType.active;
    }
  },
  computed: {
    systemTypePayload() {
      return {
        name: this.systemTypeName,
        active: this.systemTypeActive,
      };
    },
    canDeleteSystemType() {
      return !this.systemType.systems.length;
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    getLogoImage(systemName) {
      return getSystemLogo(systemName);
    },
    async saveSystemType() {
      this.isMakingRequest = true;
      try {
        if (this.systemType) {
          await this.$axios.$patch(
            `/api/api/v2/system-type/${this.systemTypeId}`,
            this.systemTypePayload
          );
        } else {
          await this.$axios.$post(
            '/api/api/v2/system-type',
            this.systemTypePayload
          );
        }
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved system type',
          },
          4000
        );
        navigateTo({name: 'admin-manage-system-types'});
      } catch (error) {
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed saving the system type. Error: ${error}`,
          },
          4000
        );
      }
    },
    async deleteSystemType() {
      try {
        this.isMakingRequest = true;
        await this.$axios.$delete(`/api/api/v2/system-type/${this.systemType}`);
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully deleted system type',
          },
          4000
        );
        navigateTo({name: 'admin-manage-system-types'});
      } catch (error) {
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed deleting the system type. Error: ${error}`,
          },
          4000
        );
      }
    },
  },
};
</script>
