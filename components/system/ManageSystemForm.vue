<template>
  <form @submit.prevent="saveSystem()">
    <Modal id="deleteConfirmation" title="Are you sure?" classes="modal--small">
      <LegacyDeleteConfirmationModal
        warning-text="Please confirm that you want to remove this system."
        @deleteCancel="closeModal"
        @deleteConfirm="runDeleteSystem"
      />
    </Modal>
    <UiTitledCard title="General">
      <SystemGeneralSystemDetails
        :initial-data="systemPayload"
        :is-update="system !== null"
        @detailsUpdated="updatePayload"
        @imageAdded="setImageFile"
      />
    </UiTitledCard>
    <template v-if="system">
      <hr />
      <UiTitledCard title="Add System Instructions">
        <div>
          Please follow the below instructions to add a new automated system.
        </div>
        <div>
          <button
            type="button"
            class="button button-primary"
            @click="
              openHelpLink(
                'https://patchworks.atlassian.net/wiki/spaces/Patchworks/pages/3140681729/How+to+add+a+new+automated+system+with+the+system+wizard'
              )
            "
          >
            Click here
          </button>
        </div>
      </UiTitledCard>
      <hr />
      <UiTitledCard title="Authentication">
        <template #content>
          <TableSystemAuthorisationTypes :system-id="parseInt(system.id)" />
        </template>
      </UiTitledCard>
      <hr />
      <UiTitledCard title="Factory Systems">
        <template #content>
          <TableFactorySystems :system-id="parseInt(system.id)" />
        </template>
      </UiTitledCard>
      <hr />
      <UiTitledCard title="Filter Templates">
        <template #content>
          <TableFilterTemplates :system-id="parseInt(system.id)" />
        </template>
      </UiTitledCard>
      <hr />
      <UiTitledCard title="Filter Fields">
        <template #content>
          <TableFilterFields :system-id="parseInt(system.id)" />
        </template>
      </UiTitledCard>
      <hr />
      <UiTitledCard title="Service Templates">
        <template #content>
          <TableServiceTemplates :system-id="parseInt(system.id)" />
        </template>
      </UiTitledCard>
    </template>
    <hr />
    <div class="flex justify-between">
      <div>
        <button
          v-if="system"
          type="button"
          class="button button-danger"
          :disabled="isMakingRequest"
          @click="openModal('deleteConfirmation')"
        >
          Delete System
        </button>
      </div>
      <UiLoading v-if="isMakingRequest" label="Saving system..." />
      <div>
        <button
          type="button"
          class="button button-secondary"
          :disabled="isMakingRequest"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="button button-primary"
          :disabled="isMakingRequest"
        >
          Save System
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'ManageSystemForm',
  props: {
    system: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      isMakingRequest: false,
      systemPayload: {
        system_type_id: null,
        name: null,
        factory_name: null,
        slug: null,
        website: null,
        description: null,
        status: null,
        documentation_link: null,
        documentation_link_description: null,
      },
      imageFile: null,
    };
  },
  computed: {
    formDataPayload() {
      const formData = new FormData();
      for (const [key, value] of Object.entries(this.systemPayload)) {
        if (value === null) {
          continue;
        }
        formData.append(key, value);
      }
      if (this.imageFile) {
        formData.append('image', this.imageFile);
      }
      if (this.system) {
        formData.append('_method', 'PATCH');
      }
      return formData;
    },
  },
  mounted() {
    if (this.system) {
      this.systemPayload.name = this.system.name;
      this.systemPayload.factory_name = this.system.factory_name;
      this.systemPayload.description = this.system.description;
      this.systemPayload.website = this.system.website;
      this.systemPayload.slug = this.system.slug;
      this.systemPayload.system_type_id = this.system.system_type_id;
      this.systemPayload.status = this.system.status;
      this.systemPayload.documentation_link = this.system.documentation_link;
      this.systemPayload.documentation_link_description =
        this.system.documentation_link_description;
      this.systemPayload.environment_suffix_title =
        this.system.environment_suffix_title;
    }
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    openHelpLink(link) {
      window.open(link, '_blank');
    },
    updatePayload(updatedDetails) {
      this.systemPayload = updatedDetails;
    },
    setImageFile(file) {
      this.imageFile = file;
    },
    async runDeleteSystem() {
      try {
        this.isMakingRequest = true;
        await this.$axios.$delete(
          `/api/api/v2/admin/systems/${this.system.id}`
        );
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully deleted the system.',
          },
          4000
        );
        this.$emit('systemDeleted');
        this.closeModal();
      } catch (e) {
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to delete system: ${e}.`,
          },
          4000
        );
        this.closeModal();
      }
    },
    async saveSystem() {
      this.isMakingRequest = true;
      try {
        const system = this.system
          ? await this.$axios
              .$post(
                `/api/api/v2/admin/systems/${this.system.id}`,
                this.formDataPayload
              )
              .then((r) => r.data)
          : await this.$axios
              .$post('/api/api/v2/admin/systems', this.formDataPayload)
              .then((r) => r.data);

        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved system',
          },
          4000
        );
        this.$emit(this.system ? 'systemUpdated' : 'systemCreated', system);
      } catch (e) {
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to save system: ${e}.`,
          },
          4000
        );
      }
    },
  },
};
</script>
