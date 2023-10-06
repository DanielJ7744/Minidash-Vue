<template>
  <UiTitledCard title="OAuth2 Clients">
    <template #info>
      <p>
        <a
          class="underline"
          href="https://oauth.net/2/"
          target="_blank"
          rel="noopener"
          >OAuth2</a
        >
        is a authorization protocol that allows you to provide secure, revokable
        API access to a third party.
      </p>
    </template>

    <template #content>
      <UiCard
        v-if="!clients.length"
        class="flex h-full items-center py-2 text-center"
      >
        <button
          type="button"
          class="focus:ring-primary-500 relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
          @click.prevent="openModal('add-inbound-token-modal')"
        >
          <!-- Heroicon name: outline/shield-check -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span class="mt-2 block text-sm font-medium text-gray-900">
            Create an OAuth2 Client
          </span>
        </button>
      </UiCard>

      <div v-else class="space-y-3">
        <UiCard v-for="client in clients" :key="client.id" class="py-2">
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <div>
                <!-- Heroicon name: solid/shield-check -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div
                class="flex w-full items-center justify-between overflow-hidden"
              >
                <p class="truncate text-base text-gray-800">
                  {{ client.name }}
                </p>
                <p class="text-right text-sm">
                  <a
                    class="text-danger cursor-pointer text-right text-sm"
                    @click.prevent="() => confirmDelete(client)"
                    >Delete</a
                  >
                </p>
              </div>
            </div>
            <hr />
            <div class="overflow-x-auto rounded bg-gray-100 py-3">
              <div class="space-y-3 px-4 font-mono text-sm text-gray-500">
                <div class="md:flex">
                  <span class="shrink-0 md:w-1/3">grant_type:</span>
                  <span class="flex-1 font-normal">client_credentials</span>
                </div>
                <div class="md:flex">
                  <span class="shrink-0 md:w-1/3">client_id:</span>
                  <span class="flex-1 whitespace-nowrap font-normal">
                    {{ client.id }}
                  </span>
                </div>
                <div class="md:flex">
                  <span class="shrink-0 md:w-1/3">client_secret:</span>
                  <span class="flex-1 whitespace-nowrap font-normal">
                    ************{{ client.safe_secret }}
                  </span>
                </div>
                <div class="md:flex">
                  <span class="shrink-0 md:w-1/3">scope:</span>
                  <span class="flex-1 font-normal">access-inbound</span>
                </div>
              </div>
            </div>
          </div>
        </UiCard>

        <div class="flex justify-end">
          <button
            type="button"
            class="button button-sm button-primary mt-3"
            :disabled="clients.length > 1"
            @click.prevent="openModal('add-inbound-token-modal')"
          >
            Add another
          </button>
        </div>
      </div>

      <Modal
        id="add-inbound-token-modal"
        title="Add OAuth2 client"
        :size="created ? 'md' : 'sm'"
        @modal-closed="created = null"
      >
        <form v-if="!created" class="space-y-3" @submit.prevent="handleSubmit">
          <FormElement
            v-model="form.name"
            required
            title="name"
            label="Name"
            :errors="errors"
            v-slot="{ inputProps, inputEvents }"
          >
            <input
              v-bind="inputProps"
              class="bg-gray-50"
              type="text"
              v-on="inputEvents"
            />
          </FormElement>

          <div class="flex flex-1 justify-end space-x-2">
            <FormLoadingButton
              class="button-primary button-sm"
              type="submit"
              :loading="submitting"
              :disabled="submitting"
            >
              Create new OAuth2 client
            </FormLoadingButton>
          </div>
        </form>

        <div
          v-else
          class="flex h-full flex-col justify-around space-y-5 md:px-3"
        >
          <div>
            <div
              class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
            >
              <svg
                class="h-6 w-6 text-green-600"
                x-description="Heroicon name: outline/check"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3
                id="modal-title"
                class="text-lg font-medium leading-6 text-gray-900"
              >
                OAuth2 Client created: {{ created.name }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Please copy this new client id and client secret and be sure
                  to store them somewhere safe for future reference.
                </p>
              </div>
            </div>
          </div>

          <!-- Client ID -->
          <div>
            <label for="client_id">Client ID</label>
            <div class="mt-1 flex rounded-md shadow-sm">
              <input
                id="client_id"
                type="text"
                name="client_id"
                :value="created.id"
                class="block w-full rounded-none rounded-l-md border-none bg-gray-100 font-mono focus:outline-none sm:text-sm"
                disabled
              />
              <button
                type="button"
                class="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:border-gray-200 active:outline-none active:ring-1 active:ring-gray-200"
                @click="() => copyToClipboard(created.id)"
              >
                <!-- Heroicon name: solid/clipboard-copy -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path
                    d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z"
                  />
                </svg>
                <span>Copy</span>
              </button>
            </div>
          </div>

          <!-- Client Secret -->
          <div>
            <label for="client_id">Client Secret</label>
            <div class="mt-1 flex rounded-md shadow-sm">
              <input
                id="client_secret"
                type="text"
                name="client_secret"
                :value="created.secret"
                class="block w-full rounded-none rounded-l-md border-none bg-gray-50 font-mono focus:outline-none sm:text-sm"
                disabled
              />
              <button
                type="button"
                class="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-50 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:border-gray-200 active:outline-none active:ring-1 active:ring-gray-200"
                @click="() => copyToClipboard(created.secret)"
              >
                <!-- Heroicon name: solid/clipboard-copy -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path
                    d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z"
                  />
                </svg>
                <span>Copy</span>
              </button>
            </div>
            <p class="mt-1 text-sm">
              For your security,
              <span class="font-medium"
                >the client secret will not be shown again.</span
              >
            </p>
          </div>

          <div class="mt-3 flex justify-center sm:justify-end">
            <button
              type="button"
              class="button button-primary"
              @click.prevent="closeModal('add-inbound-token-modal')"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        id="delete-inbound-oauth-client-modal"
        title="Delete OAuth2 client"
        classes="modal--small"
      >
        <div v-if="deleting" class="space-y-3">
          <p>
            Are you sure you want to delete this client? Any third parties using
            these credentials will lose access immediately.
          </p>

          <p class="font-medium">This cannot be undone.</p>
          <p>
            If you are sure, please type
            <span class="font-medium">
              {{ deleting.name }}
            </span>
            below to confirm.
          </p>

          <form class="space-y-3" @submit.prevent="handleDelete">
            <FormElement
              v-model="deleteConfirmation"
              required
              title="confirmation"
              label="Confirmation"
              :errors="errors"
              v-slot="{ inputProps, inputEvents }"
            >
              <input v-bind="inputProps" type="text" v-on="inputEvents" />
            </FormElement>

            <div class="flex flex-1 justify-end space-x-2">
              <FormLoadingButton
                class="button-primary"
                type="submit"
                :loading="submitting"
                :disabled="deleting.name !== deleteConfirmation || submitting"
              >
                Delete client
              </FormLoadingButton>
            </div>
          </form>
        </div>
      </Modal>
    </template>
  </UiTitledCard>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'ManageOAuthClients',
  props: {
    connector: {
      type: Object,
      required: false,
      default: null,
    },
    clients: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      errors: {},
      created: null,
      deleting: null,
      deleteConfirmation: null,
      submitting: false,
      form: {
        name: null,
      },
    };
  },
  methods: {
    ...mapActions(useUiStore, ['openModal', 'closeModal']),
    async handleSubmit() {
      this.submitting = true;

      try {
        const response = await this.$axios.$post(
          `/api/api/v2/connectors/${this.connector.id}/oauth-clients`,
          this.form
        );

        this.form.name = null;
        this.created = {
          ...response.data,
          safe_secret: response.data.secret.slice(-4),
        };
        this.$emit('created', this.created);

        this.$notify(
          { group: 'notifications', type: 'success', text: 'Client created' },
          4000
        );
      } catch (error) {
        this.errors = error.response?.data?.errors || {};
      }

      this.submitting = false;
    },
    confirmCreated() {
      this.closeModal('add-inbound-oauth-client-modal');
      this.created = null;
    },
    confirmDelete(token) {
      this.deleting = token;

      this.openModal('delete-inbound-oauth-client-modal');
    },
    async handleDelete() {
      this.submitting = true;

      try {
        await this.$axios.$delete(
          `/api/api/v2/connectors/${this.connector.id}/oauth-clients/${this.deleting.id}`,
          {
            params: { confirmation: this.deleteConfirmation },
          }
        );

        this.$emit('deleted', this.deleting.id);
        this.closeModal('delete-inbound-oauth-client-modal');
        this.deleting = null;
        this.deleteConfirmation = null;

        this.$notify(
          { group: 'notifications', type: 'success', text: 'Client deleted' },
          4000
        );
      } catch (error) {
        this.errors = error.response?.data?.errors || {};
      }

      this.submitting = false;
    },
    copyToClipboard(value) {
      navigator.clipboard.writeText(value);

      this.$notify(
        {
          group: 'notifications',
          type: 'success',
          text: 'Copied to clipboard',
        },
        2000
      );
    },
  },
};
</script>
