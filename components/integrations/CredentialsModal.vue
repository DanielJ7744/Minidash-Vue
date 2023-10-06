<template>
  <div>
    <div class="flex justify-between items-start gap-2">
      <div class="col-span-1 w-16 flex-shrink-0">
        <img :src="logoImage" alt="System Logo" class="w-16 rounded" />
      </div>
      <div class="flex-grow">
        <span>You have selected</span>
        <h6 class="mb-2">
          {{ system.name }}
        </h6>
      </div>
    </div>
    <div
      class="flex justify-between items-center flex-col md:flex-row gap-2 mt-3 md:mt-0"
    >
      <div class="flex justify-between gap-3">
        <div
          class="col-span-1 w-16 flex-shrink-0 hidden md:block"
        />
        <div v-if="system.documentation_link_description" class="flex-grow">
          <p
            class="m-0 border-blue-700 border-solid border p-3 text-blue-700 rounded flex items-start"
          >
            <span class="icon icon--warning mr-2 mt-0.5" />
            {{ system.documentation_link_description }}
          </p>
        </div>
      </div>
      <div v-if="system.documentation_link" class="self-end">
        <button
          type="button"
          class="button button-primary button-lg whitespace-nowrap"
          @click="openHelpLink(system.documentation_link)"
        >
          View Help
        </button>
      </div>
    </div>
    <hr class="content--margin-bottom-20 content--margin-top-15" />
    <!--    <CredentialSelector :class="{ 'form-item&#45;&#45;hidden': manualCredentialEntry }" @manually-enter-credentials="openManualCredentialSelector()" />-->
    <IntegrationsCredentialAdderManual
      :extra-form-data="extraFormData"
      :auth-type="selectedAuthType"
      :system="system"
      :fields="fields"
      @back="closeManualCredentialSelector()"
    />
    <button
      type="button"
      class="button button-secondary w-full mt-2"
      @click="closeModal()"
    >
      Back
    </button>
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import { systemsHelperMixin } from '~/mixins/system-helper-mixin';

export default {
  name: 'CredentialsModal',
  mixins: [systemsHelperMixin],
  props: {
    system: {
      type: Object,
      required: true,
    },
    fields: {
      type: Object,
      required: true,
    },
    authType: {
      type: String,
      required: false,
      default: () => null,
    },
    extraFormData: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      selectedAuthType: this.authType ?? this.fields.auth_types[0],
      manualCredentialEntry: false,
    };
  },
  computed: {
    logoImage() {
      return getSystemLogo(this.system.name);
    },
  },
  methods: {
    ...mapActions(useUiStore, {
      closeModal: 'closeModal',
    }),
    openManualCredentialSelector() {
      this.manualCredentialEntry = true;
    },
    closeManualCredentialSelector() {
      this.manualCredentialEntry = false;
    },
    openHelpLink(link) {
      window.open(link, '_blank');
    },
  },
};
</script>
