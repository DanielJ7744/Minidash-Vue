<template>
  <UiLoading v-if="$fetchState.pending" />
  <UiError
    v-else-if="$fetchState.error"
    message="Failed loading notification group"
  />

  <form v-else @submit.prevent="handleSubmit">
    <UiTitledCard title="Group Details">
      <template #info>
        <p>
          Give the group a useful name so that it is easy find and work with
          later.
        </p>
      </template>

      <FormElement
        v-model="form.name"
        required
        title="name"
        label="Name"
        :errors="errors"
      >
        <input v-model="form.name" required type="text" />
      </FormElement>
    </UiTitledCard>

    <template v-if="groupId">
      <hr />

      <LegacyPageSettingsNotificationGroupRecipients
        v-if="groupId"
        :group="group"
        @removed="handleRecipientRemoved"
        @added="handleRecipientAdded"
      />
    </template>

    <hr />

    <div class="sm:flex sm:items-center sm:justify-end sm:space-x-3">
      <div>
        <button
          v-if="groupId"
          type="button"
          class="button button-danger button-sm"
          @click="handleDelete"
        >
          Delete Group
        </button>
      </div>
      <div class="flex space-x-3">
        <div class="flex-1">
          <button
            type="submit"
            class="button button-primary button-sm w-full"
            :disabled="submitting"
          >
            {{ group ? 'Update' : 'Create' }} group
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
export default {
  name: 'NotificationGroupForm',
  props: {
    groupId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      group: null,
      submitting: false,
      errors: {},
      form: {
        name: null,
      },
    };
  },
  async fetch() {
    if (this.groupId) {
      this.group = await useFabric(
        `/api/v2/notification-groups/${this.groupId}`,
        {
          params: {
            include: 'recipients',
          },
        }
      ).then((r) => r.data);
      this.form.name = this.group.name;
    }
  },
  methods: {
    async handleSubmit() {
      this.errors = {};
      this.submitting = true;

      try {
        this.group = this.groupId
          ? await useFabric(`/api/v2/notification-groups/${this.groupId}`, {
              method: 'PATCH',
              body: this.form,
            }).then((r) => r.data)
          : await useFabric('/api/v2/notification-groups', {
              method: 'POST',
              body: this.form,
            }).then((r) => r.data);

        this.submitting = false;

        this.$notify({
          group: 'notifications',
          type: 'success',
          text: `Notification group ${this.group ? 'updated' : 'created'}`,
        });

        navigateTo({
          name: 'settings-notification-groups-groupId',
          params: { groupId: this.group.id },
        });
      } catch (error) {
        this.submitting = false;
        this.errors = error.response.data?.errors || {};
      }
    },
    async handleDelete() {
      const confirmed = window.confirm(
        'Are you sure you want to delete this notification group?'
      );

      if (!confirmed) {
        return;
      }

      this.submitting = true;

      try {
        await useFabric(`api/v2/notification-groups/${this.group.id}`, {
          method: 'DELETE',
        });

        this.submitting = false;

        this.$notify({
          group: 'notifications',
          type: 'success',
          text: 'Notification group deleted',
        });

        navigateTo({
          name: 'settings-notification-groups',
        });
      } catch (error) {
        this.submitting = false;

        this.$notify({
          group: 'notifications',
          type: 'error',
          text: 'Could not delete group',
        });
      }
    },
    handleRecipientAdded(added) {
      this.group.recipients.push(added);
    },
    handleRecipientRemoved(removed) {
      this.group.recipients = this.group.recipients.filter(
        (r) => r.id !== removed.id
      );
    },
  },
};
</script>
