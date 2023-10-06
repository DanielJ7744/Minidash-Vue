<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <div v-else>
    <div class="mb-2">
      <label> Name </label>
      <input
        v-model="formDetails.name"
        type="text"
        placeholder="Please enter a name."
        required
        min="3"
        max="255"
        class="w-full"
        @change="inputChanged"
      />
    </div>
    <div class="mb-2">
      <label> Factory Name </label>
      <input
        v-model="formDetails.factory_name"
        type="text"
        placeholder="Please enter a factory name. This is often the same as the system name."
        required
        min="3"
        max="255"
        class="w-full"
        @change="inputChanged"
      />
    </div>
    <div class="mb-2">
      <label> System Type </label>
      <select
        v-model="formDetails.system_type_id"
        class="w-full"
        required
        @change="inputChanged"
      >
        <option
          v-for="systemType in systemTypes"
          :key="systemType.id"
          :value="systemType.id"
        >
          {{ systemType.name }}
        </option>
      </select>
    </div>
    <div class="mb-2">
      <label> Description </label>
      <input
        v-model="formDetails.description"
        type="text"
        placeholder="Please enter a description"
        required
        min="3"
        max="255"
        class="w-full"
        @change="inputChanged"
      />
    </div>
    <div class="mb-2">
      <label> Website </label>
      <input
        v-model="formDetails.website"
        type="text"
        placeholder="Please enter a website."
        required
        min="3"
        max="255"
        pattern="^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})+$"
        title="Please enter a valid https URL."
        class="w-full"
        @change="inputChanged"
      />
    </div>
    <div class="mb-2">
      <label> Slug </label>
      <input
        v-model="formDetails.slug"
        type="text"
        placeholder="Please enter a slug."
        min="3"
        max="255"
        pattern="[a-zA-Z \-[\]!&0-9]+$"
        title="Slug must contain alphabetical, dash, underscore and space characters only."
        class="w-full"
        @change="inputChanged"
      />
    </div>
    <div class="mb-2">
      <label> Status </label>
      <select
        v-model="formDetails.status"
        class="w-full"
        required
        @change="inputChanged"
      >
        <option value="active">
          Active (Available to all users to interact with)
        </option>
        <option value="inactive">
          Coming Soon (All users can see system is coming soon)
        </option>
        <option value="development">
          Dev Only (Only patchworks users can see and interact with)
        </option>
        <option value="hidden">Hidden (System will not show for anyone)</option>
      </select>
    </div>
    <div class="mb-2">
      <label> Documentation/GitBooks Link </label>
      <input
        v-model="formDetails.documentation_link"
        type="text"
        placeholder="Please enter a link to the documentation."
        min="3"
        max="255"
        pattern="^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})+$"
        title="Please enter a valid https URL."
        class="w-full"
        @change="inputChanged"
      />
    </div>
    <div class="mb-2">
      <label> Connector Help Text </label>
      <input
        v-model="formDetails.documentation_link_description"
        type="text"
        placeholder="Please enter text to help the user when they are adding this system."
        class="w-full"
        @change="inputChanged"
      />
    </div>
    <div class="mb-2">
      <label class="mb-2"> Environment Suffix Title </label>
      <input
        v-model="formDetails.environment_suffix_title"
        class="w-full"
        type="text"
        @change="inputChanged"
      />
    </div>
    <div v-if="!isUpdate" class="mb-2">
      <label class="mb-2 block text-sm font-medium" for="file_input"
        >Image (Required; not currently used)</label
      >
      <input
        class="mt-1 w-full text-sm"
        id="file_input"
        type="file"
        accept="image/svg+xml"
        required
        @change="imageAdded"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia';

export default {
  name: 'GeneralSystemDetails',
  props: {
    initialData: {
      type: Object,
      required: false,
      default: () => ({
        system_type_id: null,
        name: null,
        factory_name: null,
        slug: null,
        website: null,
        description: null,
        status: null,
        documentation_link: null,
        documentation_link_description: null,
        environment_suffix_title: null,
      }),
    },
    isUpdate: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      formDetails: {
        system_type_id: null,
        name: null,
        factory_name: null,
        slug: null,
        website: null,
        description: null,
        status: null,
        documentation_link: null,
        documentation_link_description: null,
        environment_suffix_title: null,
      },
    };
  },
  async fetch() {
    await this.loadSystemTypes();
    this.formDetails = this.initialData;
    if (this.systemTypes.length && !this.formDetails.system_type_id) {
      this.formDetails.system_type_id = this.systemTypes[0].id;
    }
  },
  computed: {
    ...mapState(useSystemStore, {
      systemTypes: 'systemTypes',
    }),
  },
  methods: {
    ...mapActions(useSystemStore, ['loadSystemTypes']),
    imageAdded(event) {
      this.$emit('imageAdded', event.target.files[0]);
    },
    inputChanged() {
      this.$emit('detailsUpdated', this.formDetails);
    },
  },
};
</script>
