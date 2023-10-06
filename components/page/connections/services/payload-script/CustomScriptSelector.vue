<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <form v-else @submit.prevent="addCustomScriptToService">
    <div>
      <UiTitledCard title="Script Details">
        <FormElement
          v-model="selectedCustomScriptId"
          title="selected_script"
          label="Select Custom Script"
          :errors="errors"
          required
          v-slot="{ inputProps, inputEvents }"
        >
          <select
            class="w-full bg-white"
            v-bind="inputProps"
            :disabled="isLoading"
            v-on="inputEvents"
          >
            <option selected disabled>Please select...</option>
            <option
              v-for="customScript in customScripts"
              :key="customScript.id"
              :value="customScript.id"
            >
              {{ customScript.name }} - {{ customScript.description }}
            </option>
          </select>
        </FormElement>
        <template v-if="selectedCustomScript">
          <FormElement
            title="custom_script_description"
            label="Description"
            :errors="errors"
          >
            <input
              :value="selectedCustomScript.description"
              type="text"
              class="w-full bg-white"
              disabled
            />
          </FormElement>
          <FormElement
            title="custom_script_total_params"
            label="Total Parameters"
            :errors="errors"
          >
            <input
              :value="selectedCustomScript.total_params"
              type="number"
              class="w-full bg-white"
              disabled
            />
          </FormElement>
        </template>
      </UiTitledCard>
    </div>
    <template v-if="selectedCustomScript">
      <hr />
      <UiTitledCard title="Script Code">
        <template #info>
          <NuxtLink
            tag="button"
            class="button button-primary button-sm"
            :to="{
              name: 'settings-manage-scripts-scriptId',
              params: { scriptId: selectedCustomScript.id },
            }"
          >
            Edit script
          </NuxtLink>
        </template>
        <MonacoEditor
          v-model="selectedCustomScript.script_code"
          :lang="language"
          :options="{ readOnly: true, automaticLayout: true, tabSize: 2, wordWrap: 'on' }"
          class="h-80 w-full"
        />
      </UiTitledCard>
      <div class="flex justify-end">
        <button
          v-if="customScriptId"
          type="button"
          class="button button-danger"
          :disabled="isLoading"
          @click="openModal('scriptRemoveConfirmation')"
        >
          Remove Script from Service
        </button>
        <button
          v-else
          type="submit"
          class="button button-primary"
          :disabled="isLoading"
        >
          Add Script to Service
        </button>
      </div>
    </template>

    <Modal
      id="scriptRemoveConfirmation"
      title="Are you sure?"
      classes="modal--small"
    >
      <LegacyDeleteConfirmationModal
        warning-text="This service will no longer use this custom script on the payload."
        delete-explanation="If this is needed to provide custom functionality for this service please cancel this operation."
        confirmation-label="If you are satisfied that this script is no longer being used and you are ready to remove it, please type the word 'confirm' in the field below."
        @deleteCancel="closeModal"
        @deleteConfirm="removeScriptFromService"
      />
    </Modal>
  </form>
</template>

<script>
import { mapActions } from 'pinia';
import { getEditorCustomScriptLanguage } from '@/lib/customScripting';

const EventBus = useLegacyEventBus();

export default {
  name: 'CustomScriptSelector',
  props: {
    service: {
      type: Object,
      required: true,
    },
    customScriptId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  setup() {
    return {
      route: useRoute(),
    };
  },
  data() {
    return {
      customScripts: [],
      selectedCustomScriptId: null,
      errors: {},
      isLoading: false,
    };
  },
  async fetch() {
    this.customScripts = await fetchAllPaginatedResults(
      this.$axios,
      `/api/api/v1/transform-scripts/company/${this.$auth.user.company_id}/custom_scripts`
    );
    if (this.customScriptId) {
      this.selectedCustomScriptId = this.customScriptId;
    }
  },
  computed: {
    selectedCustomScript() {
      if (!this.selectedCustomScriptId) {
        return null;
      }
      return this.customScripts.find(
        (customScript) =>
          parseInt(customScript.id) === parseInt(this.selectedCustomScriptId)
      );
    },
    language() {
      if (!this.selectedCustomScript) {
        return null;
      }
      return getEditorCustomScriptLanguage(this.selectedCustomScript.language);
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    async addCustomScriptToService() {
      this.isLoading = true;
      try {
        const servicePayload = {
          custom_script_id: this.selectedCustomScript.id,
        };

        await this.$axios.$post(
          `/api/api/v2/services/${this.service.id}/settings`,
          servicePayload
        );

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully added custom script to service',
          },
          4000
        );

        EventBus.emit('service:updated', this.service.id);

        navigateTo({
          name: 'connections-connectionId-services-serviceId-canvas',
          params: {
            connectionId: this.route.params.connectionId,
            serviceId: this.route.params.serviceId,
          },
        });
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to add custom script to service: ${error}`,
          },
          4000
        );
      }
      this.isLoading = false;
    },
    async removeScriptFromService() {
      this.closeModal();
      this.isLoading = true;
      try {
        const servicePayload = {
          custom_script_id: null,
        };

        await this.$axios.$post(
          `/api/api/v2/services/${this.service.id}/settings`,
          servicePayload
        );

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully remove custom script from service',
          },
          4000
        );

        EventBus.emit('service:updated', this.service.id);

        navigateTo({
          name: 'connections-connectionId-services-serviceId-canvas',
          params: {
            connectionId: this.route.params.connectionId,
            serviceId: this.route.params.serviceId,
          },
        });
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to remove custom script from service: ${error}`,
          },
          4000
        );
      }
      this.isLoading = false;
    },
  },
};
</script>
