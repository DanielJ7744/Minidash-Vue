<template>
  <div class="page-container-fluid page-container space-y-5">
    <PageHeader>
      <template #title>Alerts</template>
      <template #description>{{ service.description }}</template>
      <template #actions>
        <SystemIcon
          class="aspect-square w-12 rounded"
          :system-name="getDestinationFactoryName(service)"
        />
      </template>
    </PageHeader>

    <form @submit.prevent="handleSubmit">
      <UiTitledCard title="Settings">
        <div class="flex items-center justify-between">
          <div>
            <p>Include failures in summary</p>
            <p class="text-xs">
              {{
                form.include_in_daily_failure_summary ? 'Included' : 'Excluded'
              }}
            </p>
          </div>
          <FormToggle v-model="form.include_in_daily_failure_summary" />
        </div>
      </UiTitledCard>
      <div class="align-center flex flex-col justify-end gap-2 md:flex-row">
        <div>
          <button
            type="submit"
            class="button button-primary content--full-width"
            :disabled="submitting"
          >
            {{ isNewService ? 'Next' : 'Save' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { goToNextSetupStep } from '@/lib/serviceSetup';

export default {
  name: 'Notifications',
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
  data() {
    return {
      submitting: false,
      form: {
        include_in_daily_failure_summary:
          this.service.settings?.include_in_daily_failure_summary || false,
      },
    };
  },
  computed: {
    isNewService() {
      return this.route.query.path === 'new';
    },
  },
  methods: {
    async handleSubmit() {
      this.submitting = true;
      try {
        await this.$axios.$post(
          `/api/api/v2/services/${this.service.id}/settings`,
          this.form
        );

        this.errors = {};
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Service settings updated successfully',
          },
          4000
        );

        if (this.isNewService) {
          goToNextSetupStep(
            'settings',
            this.route.params.connectionId,
            this.route.params.serviceId
          );
        }
      } catch (error) {
        this.errors = error.response.data.errors;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: 'Please check the form for errors',
          },
          4000
        );
      }

      this.submitting = false;
    },
    getDestinationFactoryName(service) {
      return service.destination_system !== null
        ? service.destination_system.name
        : 'patchworks';
    },
  },
};
</script>
