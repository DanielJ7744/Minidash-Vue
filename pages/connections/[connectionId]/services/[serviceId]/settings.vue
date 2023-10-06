<template>
  <div class="page-container-fluid page-container space-y-5 divide-y">
    <PageHeader>
      <template #title>Service settings</template>
      <template #actions>
        <SystemChainIcons
          :loading="$fetchState.pending"
          :source="sourceSystem"
          :destination="destinationSystem"
        />
      </template>
    </PageHeader>

    <UiLoading v-if="$fetchState.pending" />
    <div v-else>
      <form class="divide-y" @submit.prevent="saveService()">
        <ServicesServiceStatus v-model="form.details.status" :errors="errors" />
        <ServicesSettingsServiceSettings
          v-model="form.details"
          :errors="errors"
          :selected-service-template="service.service_template"
          :source-system="sourceSystem"
        />
        <ServicesServiceNotes :initial-notes="notes" :service-id="service.id" />

        <div
          class="flex flex-1 flex-col-reverse justify-between gap-2 py-5 sm:flex-row sm:gap-4"
        >
          <ServicesSettingsServiceRemove
            :service="service"
            :errors="errors"
            class="flex-grow self-end sm:w-auto sm:self-auto"
          />
          <div class="flex w-full gap-2 sm:w-auto">
            <button
              type="submit"
              class="button button-primary"
              :disabled="submitting"
            >
              Save
            </button>
          </div>
        </div>
      </form>
      <Modal
        id="emptyFilterWarning"
        classes="modal--small"
        title="Are you sure you wish to continue with these settings?"
        :close-on-backdrop-click="false"
      >
        <ServicesEmptyFilterWarning @confirm="handleSubmit()" />
      </Modal>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import clone from 'just-clone';
import Systems from '@/enums/Systems';

const EventBus = useLegacyEventBus();

export default {
  name: 'ServiceSettingsPage',
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      form: {
        details: {
          id: this.service.id,
          timezone: this.service.from_options?.timezone,
          status: this.service.status,
          date_format: this.service.from_options?.date_format,
          calls_per_second: this.service.from_options?.calls_per_second,
          description: this.service.description,
          billable: this.service.billable,
          type: this.service?.type || 'Standard',
        },
        alertStatus: null,
        alertSchedule: null,
      },
      notes: [],
      submitting: false,
      errors: {},
      sourceSystem: null,
      destinationSystem: null,
    };
  },
  async fetch() {
    [this.sourceSystem, this.destinationSystem, this.notes] = await Promise.all(
      [
        this.service.source_system_id
          ? this.$axios
              .$get(
                `/api/api/v2/systems/${this.service.source_system_id}?include=webhookFactory`
              )
              .then((r) => r.data)
          : null,
        this.service.destination_system_id
          ? this.$axios
              .$get(`/api/api/v2/systems/${this.service.destination_system_id}`)
              .then((r) => r.data)
          : null,
        this.$axios
          .$get(`/api/api/v2/services/${this.service.id}/service-notes`)
          .then((r) => r.data),
      ]
    );
  },
  computed: {
    payload() {
      const payload = clone(this.form.details);
      if (!this.$patchworksAdmin()) {
        delete payload.billable;
      }

      return {
        ...payload,
        from_options: {
          timezone: this.form.details.timezone,
          date_format: this.form.details.date_format,
          calls_per_second: this.form.details.calls_per_second || 1,
        },
      };
    },
  },
  methods: {
    ...mapActions(useUiStore, ['openModal']),
    ...mapActions(useSubscriptionStore, { fetchSubscriptions: 'initialise' }),
    async saveService() {
      if (
        this.service.filters?.length === 0 &&
        ![Systems.SFTP, Systems.INBOUND_API].includes(
          this.service.source_system.name
        )
      ) {
        this.openModal('emptyFilterWarning');
      } else {
        await this.handleSubmit();
      }
    },
    async handleSubmit() {
      this.submitting = true;

      try {
        await this.$axios.$patch(
          `/api/api/v2/services/${this.service.id}`,
          this.payload
        );
        this.errors = {};

        await this.fetchSubscriptions();

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Service updated successfully',
          },
          4000
        );

        EventBus.emit('service:updated', this.service.id);
      } catch (error) {
        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors;
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: 'Please check the form for errors',
            },
            4000
          );
        } else {
          this.errors = {};
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: 'An error occurred while updating the service.',
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
