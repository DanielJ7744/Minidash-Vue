<template>
  <div class="space-y-3 lg:flex lg:space-y-0">
    <form
      class="pl-1 sm:pl-0"
      @submit.prevent="openModal('deleteServiceModal')"
    >
      <button
        type="submit"
        class="px-2 sm:px-10 button button-danger"
        :disabled="submitting"
      >
        Remove service
      </button>
    </form>
    <Modal
      id="deleteServiceModal"
      classes="modal--small"
      title="Are you sure?"
      :close-on-backdrop-click="false"
    >
      <ServicesSettingsDeleteServiceModal
        :service="service"
        @delete="handleSubmit()"
      />
    </Modal>
  </div>
</template>

<script>
import { mapActions } from 'pinia';

const EventBus = useLegacyEventBus();

export default {
  name: 'ServiceRemove',
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {
      route: useRoute(),
    };
  },
  data: () => ({
    submitting: false,
    errors: {},
  }),
  methods: {
    ...mapActions(useUiStore, ['openModal']),
    async handleSubmit() {
      try {
        this.submitting = true;

        await this.$axios.$delete(`/api/api/v2/services/${this.service.id}`);

        EventBus.emit('service.list:removed', this.service);

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Service deleted successfully',
          },
          4000
        );

        navigateTo({
          name: 'connections-connectionId',
          params: { connectionId: this.route.params.connectionId },
        });
      } catch (error) {
        if (error.response?.status === 403) {
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: 'You are not authorized to delete this service',
            },
            4000
          );
        } else {
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: 'An error occurred while deleting the service',
            },
            4000
          );
        }
      }
      this.submitting = false;
    },
  },
};
</script>
