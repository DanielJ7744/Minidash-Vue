<template>
  <div>
    <UiTitledCard title="Group Recipients" class="flex items-center">
      <template #info>
        <p>
          Add users or email addresses to this group. Users will be notified
          when a notification is sent to this group.
        </p>
      </template>

      <div v-if="!group.recipients.length">
        <p class="text-sm">
          There are no recipients for this group. Get started by adding a user
          or email address.
        </p>
      </div>

      <ul v-else role="list" class="divide-y divide-gray-200">
        <li
          v-for="recipient in group.recipients"
          :key="recipient.id"
          class="flex justify-between py-4"
        >
          <div class="ml-3">
            <p class="text-sm">
              {{ recipient.user ? recipient.user.email : recipient.email }}
              <span v-if="recipient.user_id" class="text-xs text-gray-500">
                ({{ recipient.user.name }})
              </span>
            </p>
          </div>
          <div>
            <a
              href="#"
              class="text-xs text-red-500"
              @click.prevent="handleDelete(recipient)"
            >
              remove
            </a>
          </div>
        </li>
      </ul>

      <div class="flex justify-end">
        <button
          class="button button-primary button-sm"
          @click.prevent="openModal('add-notification-recipient')"
        >
          Add recipient
        </button>
      </div>
    </UiTitledCard>

    <Modal id="add-notification-recipient" title="Add recipient">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <h6 class="h6">Recipient type</h6>
          <p class="text-sm">Add a dashboard user or an email address</p>
          <fieldset class="mt-4">
            <legend class="sr-only">Notification method</legend>
            <div
              class="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10"
            >
              <div
                v-for="(recipientMethod, i) in ['user', 'email']"
                :key="i"
                class="flex items-center"
              >
                <FormElement
                  v-model="recipientType"
                  title="notification-method"
                  :label="recipientMethod"
                  v-slot="{ inputProps, inputEvents }"
                >
                  <input
                    name="notification-method"
                    type="radio"
                    v-bind="inputProps"
                    v-on="inputEvents"
                    :value="recipientMethod"
                    :checked="recipientMethod === recipientType"
                  />
                </FormElement>
              </div>
            </div>
          </fieldset>
        </div>

        <FormElement
          v-if="recipientType === 'email'"
          v-model="form.email"
          required
          title="email"
          label="Email"
          :errors="errors"
          v-slot="{ inputProps, inputEvents }"
        >
          <input v-bind="inputProps" type="text" v-on="inputEvents" />
        </FormElement>

        <FormElement
          v-if="recipientType === 'user'"
          v-model="form.user_id"
          required
          title="user_id"
          label="User"
          :errors="errors"
          v-slot="{ inputProps, inputEvents }"
        >
          <select v-bind="inputProps" v-on="inputEvents">
            <option value="">Select a user...</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.email }} ({{ user.name }})
            </option>
          </select>
        </FormElement>

        <div class="flex flex-1 justify-end space-x-2">
          <FormLoadingButton
            class="button-primary button-sm"
            type="submit"
            :loading="submitting"
            :disabled="submitting"
          >
            Add recipient
          </FormLoadingButton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'NotificationGroupRecipients',
  props: {
    group: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      submitting: false,
      users: [],
      errors: {},
      recipientType: 'user',
      form: {
        user_id: null,
        email: null,
      },
    };
  },
  async fetch() {
    this.users = await useFabric('/api/v2/users').then((r) => r.data);
  },
  watch: {
    recipientType: 'resetForm',
  },
  methods: {
    ...mapActions(useUiStore, ['openModal', 'closeModal']),
    resetForm() {
      this.form = {
        user_id: undefined,
        email: undefined,
      };
    },
    async handleSubmit() {
      this.errors = {};
      this.submitting = true;

      try {
        const { data: recipient } = await useFabric(
          `/api/v2/notification-groups/${this.group.id}/recipients`,
          { method: 'POST', body: this.form }
        );

        this.submitting = false;

        this.closeModal('add-notification-recipient');

        this.resetForm();

        this.$notify({
          group: 'notifications',
          type: 'success',
          text: 'Recipient added',
        });

        this.$emit('added', recipient);
      } catch (error) {
        this.submitting = false;
        this.errors = error.response._data?.errors || {};
      }
    },
    async handleDelete(recipient) {
      const confirmed = window.confirm(
        `Are you sure you want to remove ${
          recipient.user_id ? recipient.user.email : recipient.email
        }?`
      );

      if (!confirmed) {
        return;
      }

      this.submitting = true;

      try {
        await useFabric(
          `api/v2/notification-groups/${this.group.id}/recipients/${recipient.id}`,
          { method: 'DELETE' }
        );

        this.submitting = false;

        this.$notify({
          group: 'notifications',
          type: 'success',
          text: 'Recipient removed',
        });

        this.$emit('removed', recipient);
      } catch (error) {
        this.submitting = false;

        this.$notify({
          group: 'notifications',
          type: 'error',
          text: 'An error occurred while removing the recipient',
        });
      }
    },
  },
};
</script>
