<template>
  <UiTitledCard title="Schedule">
    <form class="space-y-8" @submit.prevent="handleSubmit">
      <div>
        <h4 class="h6">Current schedule</h4>
        <p class="text-sm">{{ humanCron(service.schedule) }}</p>
      </div>
      <div>
        <FormCronBuilder v-model="cronExpression" />
      </div>
      <div>
        <h4 class="h6">Updated schedule</h4>
        <FormElement
          class="space-y-2"
          title="schedule"
          :errors="errors"
          required
        >
          <input
            type="text"
            class="font-mono"
            disabled
            :value="cronExpression"
          />
          <template #info>
            {{ humanCron(cronExpression) }}
          </template>
        </FormElement>
      </div>
      <div class="flex flex-1 justify-end space-x-2">
        <button
          v-if="isNewService"
          type="submit"
          class="button button-primary"
          :disabled="submitting"
        >
          Next
        </button>
        <button
          v-else
          type="submit"
          class="button button-primary"
          :disabled="submitting"
        >
          Save
        </button>
      </div>
    </form>
  </UiTitledCard>
</template>

<script>
import { isValidCron } from 'cron-validator';
import Systems from '@/enums/Systems';
import { goToNextSetupStep } from '@/lib/serviceSetup';
import { showError } from '@/lib/api/error';

const EventBus = useLegacyEventBus();

export default {
  name: 'TriggerSchedule',
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
      isValid: null,
      submitting: false,
      cronExpression: null,
      invalidNonAdminCron: [],
      errors: {},
    };
  },
  computed: {
    isNewService() {
      return this.route.query.path === 'new';
    },
    visibleCronEditorTabs() {
      const normalTabs = ['minutes', 'hourly', 'daily', 'weekly', 'monthly'];
      const adminTabs = normalTabs.concat(['advanced']);
      return this.$patchworks() ? adminTabs : normalTabs;
    },
    nextSetupEndpoint() {
      return [Systems.SFTP, Systems.INBOUND_API].includes(
        this.service.source_system.name
      )
        ? 'mapping'
        : 'filters';
    },
  },
  created() {
    this.cronExpression = isValidCron(this.service.schedule)
      ? this.service.schedule
      : '*/10 * * * *';
    this.isValid = isValidCron(this.service.schedule);
  },
  methods: {
    async handleSubmit() {
      this.submitting = true;

      if (this.cronExpression && typeof this.cronExpression === 'string') {
        const humanExpression = humanCron(this.cronExpression);
        const isLessThan10Minutes =
          /^Every [0-9] minute/.test(humanExpression) ||
          /^Every minute/.test(humanExpression);

        if (isLessThan10Minutes && !this.$patchworks()) {
          this.$notify({
            group: 'notifications',
            type: 'error',
            text: 'Services must run with a minimum of 10 minute intervals.',
          });

          this.submitting = false;

          return;
        }
      }

      try {
        await this.$axios.$put(`/api/api/v2/services/${this.service.id}`, {
          schedule:
            this.cronExpression !== null && isValidCron(this.cronExpression)
              ? this.cronExpression
              : 'off',
        });

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Service schedule updated',
          },
          5000
        );
        EventBus.emit('service:updated', this.service.id);

        if (this.isNewService) {
          goToNextSetupStep(
            this.nextSetupEndpoint,
            this.route.params.connectionId,
            this.route.params.serviceId
          );
        } else {
          navigateTo({
            name: 'connections-connectionId-services-serviceId-canvas',
            params: {
              connectionId: this.route.params.connectionId,
              serviceId: this.route.params.serviceId,
            },
          });
        }
      } catch (error) {
        this.errors = error.response.data?.errors || {};

        showError(this.$notify, error, 5000);
      }

      this.submitting = false;
    },
  },
};
</script>
