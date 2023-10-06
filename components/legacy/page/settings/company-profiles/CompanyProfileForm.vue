<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <form v-else @submit.prevent="saveProfile">
    <Modal id="deleteConfirmation" title="Are you sure?">
      <LegacyPageSettingsCompanyProfilesProfileDeleteConfirmationModal
        @deleteConfirm="deleteProfile"
      />
    </Modal>
    <UiTitledCard title="General">
      <div>
        <FormElement
          v-model="companyName"
          title="name"
          label="Profile Name"
          :errors="errors"
          required
          v-slot="{ inputProps, inputEvents }"
        >
          <input
            id="name"
            type="text"
            pattern="[a-zA-Z0-9 \-&]+"
            v-bind="inputProps"
            :disabled="makingRequest"
            v-on="inputEvents"
          />
        </FormElement>
      </div>
      <div>
        <FormElement
          v-model="companyWebsite"
          title="company_website"
          label="Company Website"
          :errors="errors"
          v-slot="{ inputProps, inputEvents }"
        >
          <input
            id="website"
            type="text"
            v-bind="inputProps"
            :disabled="makingRequest"
            v-on="inputEvents"
          />
        </FormElement>
      </div>
      <div>
        <FormElement
          v-model="companyPhone"
          title="company_phone"
          label="Company Phone"
          :errors="errors"
          v-slot="{ inputProps, inputEvents }"
        >
          <input
            id="phone"
            type="text"
            v-bind="inputProps"
            :disabled="makingRequest"
            v-on="inputEvents"
          />
        </FormElement>
      </div>
      <div>
        <FormElement
          v-model="companyEmail"
          title="company_email"
          label="Company Email"
          :errors="errors"
          v-slot="{ inputProps, inputEvents }"
        >
          <input
            id="email"
            type="text"
            v-bind="inputProps"
            :disabled="makingRequest"
            v-on="inputEvents"
          />
        </FormElement>
      </div>
    </UiTitledCard>

    <!-- Daily summary notification group -->
    <hr />
    <UiTitledCard title="Alerts notification group">
      <div>
        <FormElement
          v-model="settings.failure_summary_notification_group_id"
          title="failure_summary_notification_group_id"
          label="Alert group"
          :errors="errors"
          v-slot="{ inputProps, inputEvents }"
        >
          <select v-bind="inputProps" v-on="inputEvents">
            <option value="" disabled>Please select...</option>
            <option
              v-for="group in notificationGroups"
              :key="group.id"
              :value="group.id"
            >
              <span>{{ group.name }}</span>
            </option>
            <option value="" disabled>Select a group</option>
          </select>
        </FormElement>
      </div>
    </UiTitledCard>
    <!--  -->

    <template v-if="$patchworksAdmin()">
      <hr />
      <UiTitledCard title="Subscriptions">
        <div>
          <label> Subscription Tier </label>
          <select
            id="subscription_tier"
            v-model="selectedNonBiSubscription"
            :disabled="makingRequest || !nonBiSubscriptions.length"
          >
            <option
              v-for="nonBiSubscription in nonBiSubscriptions"
              :key="nonBiSubscription.name"
              :value="nonBiSubscription.id"
            >
              {{ nonBiSubscription.name }}
            </option>
          </select>
        </div>
        <div>
          <label> BI Insights Tier </label>
          <select
            id="bi_subscription_tier"
            v-model="selectedBiSubscription"
            :disabled="makingRequest || !biSubscriptions.length"
          >
            <option
              v-for="biSubscription in biSubscriptions"
              :key="biSubscription.name"
              :value="biSubscription.id"
            >
              {{ biSubscription.name }}
            </option>
          </select>
        </div>
      </UiTitledCard>
    </template>
    <template v-if="companyProfile">
      <hr />
      <UiTitledCard title="Users">
        <template #content>
          <TableUsers :company-id="companyProfile.id" />
        </template>
      </UiTitledCard>
      <hr />
      <UiTitledCard title="Company Groups">
        <template #content>
          <TableCompanyGroups :profile-id="companyProfile.id" />
        </template>
      </UiTitledCard>
    </template>
    <hr />
    <div class="flex justify-between">
      <div>
        <button
          v-if="$patchworksAdmin()"
          type="button"
          class="button button-danger"
          :disabled="!companyProfile || makingRequest"
          @click="openModal('deleteConfirmation')"
        >
          Delete Profile
        </button>
      </div>
      <div>
        <NuxtLink
          :to="{
            name: $patchworksAdmin()
              ? 'admin-company-profiles'
              : 'settings-company-profile-profileId',
            params: { profileId: $auth.user.company_id },
          }"
        >
          <button
            type="button"
            class="button button-secondary"
            :disabled="makingRequest"
          >
            Cancel
          </button>
        </NuxtLink>
        <button
          type="submit"
          class="button button-primary"
          :disabled="makingRequest"
        >
          Save Profile
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'CompanyProfileForm',
  props: {
    profileId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      makingRequest: false,
      companyProfile: null,
      companyName: null,
      companyEmail: null,
      companyPhone: null,
      companyWebsite: null,
      notificationGroups: [],
      errors: {},
      subscriptions: [],
      selectedNonBiSubscription: null,
      currentNonBiSubscription: null,
      selectedBiSubscription: null,
      currentBiSubscription: null,
      settings: {
        failure_summary_notification_group_id: null,
      },
    };
  },
  async fetch() {
    [this.subscriptions, this.notificationGroups] = await Promise.all([
      this.$axios.$get('/api/api/v2/subscriptions').then((r) => r.data),
      this.$axios.$get('/api/api/v2/notification-groups').then((r) => r.data),
    ]);

    if (this.profileId) {
      if (this.$patchworks()) {
        this.companyProfile = await this.$axios
          .$get(`/api/api/v2/patchworks/companies/${this.profileId}`, {
            params: {
              include: ['subscriptions', 'settings'].join(','),
            },
          })
          .then((r) => r.data);
      } else {
        this.companyProfile = await this.$axios
          .$get('/api/api/v2/my/company', {
            params: {
              include: ['subscriptions', 'settings'].join(','),
            },
          })
          .then((r) => r.data);
      }
    }
    this.addDefaultsAndInitialData();
  },
  computed: {
    nonBiSubscriptions() {
      return this.subscriptions.filter(
        (subscription) => subscription.product_type === 'subscription'
      );
    },
    biSubscriptions() {
      return this.subscriptions.filter(
        (subscription) => subscription.product_type === 'bi_subscription'
      );
    },
    profilePayload() {
      return {
        name: this.companyName,
        company_website: this.companyWebsite,
        company_phone: this.companyPhone,
        company_email: this.companyEmail,
        active: true,
      };
    },
    integrationPayload() {
      return {
        active: 1,
        name: this.companyName,
        username: this.companyName,
        company_id: this.companyProfile.id,
      };
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    ...mapActions(useAuthStore, ['initialise']),
    addDefaultsAndInitialData() {
      if (this.nonBiSubscriptions.length) {
        const defaultNonBiSubscription = this.nonBiSubscriptions.find(
          (subscription) => subscription.name.toLowerCase() === 'sandbox'
        );
        this.selectedNonBiSubscription = defaultNonBiSubscription
          ? defaultNonBiSubscription.id
          : this.nonBiSubscriptions[0].id;
      }
      if (this.biSubscriptions.length) {
        const defaultBiSubscription = this.biSubscriptions.find(
          (subscription) => subscription.name.toLowerCase() === 'none'
        );
        this.selectedBiSubscription = defaultBiSubscription
          ? defaultBiSubscription.id
          : this.biSubscriptions[0].id;
      }
      if (this.companyProfile) {
        this.companyName = this.companyProfile.name;
        this.companyWebsite = this.companyProfile.company_website;
        this.companyEmail = this.companyProfile.company_email;
        this.companyPhone = this.companyProfile.company_phone;

        this.settings.failure_summary_notification_group_id =
          this.companyProfile.settings?.failure_summary_notification_group_id;

        this.companyProfile.subscriptions.forEach((subscription) => {
          const matchingSubscription = this.subscriptions.find(
            (loadedSubscription) => loadedSubscription.id === subscription.id
          );
          if (matchingSubscription) {
            if (matchingSubscription.product_type === 'subscription') {
              this.selectedNonBiSubscription = matchingSubscription.id;
              this.currentNonBiSubscription = matchingSubscription.id;
            }
            if (matchingSubscription.product_type === 'bi_subscription') {
              this.selectedBiSubscription = matchingSubscription.id;
              this.currentBiSubscription = matchingSubscription.id;
            }
          }
        });
      }
    },
    async deleteProfile() {
      try {
        this.makingRequest = true;
        await this.$axios.$delete(
          `/api/api/v2/admin/companies/${this.companyProfile.id}`
        );
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully deleted company',
          },
          4000
        );
        navigateTo({ name: 'admin-company-profiles' });
        this.makingRequest = false;
      } catch (error) {
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed deleting company profile: ${error}`,
          },
          4000
        );
      }
    },
    async saveProfile() {
      if (!this.companyProfile && this.$cannot('create company-profiles')) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: 'You do not have permission to create a company profile',
          },
          4000
        );

        return;
      }

      if (this.companyProfile) {
        await this.updateProfile();
        await this.initialise();

        return;
      }

      await this.createProfile();
    },
    async createProfile() {
      try {
        this.makingRequest = true;
        this.companyProfile = await this.$axios
          .$post('/api/api/v2/admin/companies', this.profilePayload)
          .then((r) => r.data);
        await this.sendAddSubscriptionRequests();
        await this.$axios.$post(
          this.$patchworksAdmin()
            ? '/api/api/v2/admin/integrations'
            : '/api/api/v2/integrations',
          this.integrationPayload
        );
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved company',
          },
          4000
        );
      } catch (error) {
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed saving company profile: ${error}`,
          },
          4000
        );
        if (error.response.status !== 422) {
          throw error;
        }

        this.errors = error.response?.data?.errors || {};
      }
    },
    async updateProfile() {
      try {
        this.makingRequest = true;
        this.companyProfile = this.$patchworksAdmin()
          ? await this.$axios
              .$patch(
                `/api/api/v2/admin/companies/${this.companyProfile.id}`,
                this.profilePayload
              )
              .then((r) => r.data)
          : await this.$axios
              .$patch('/api/api/v2/my/company', this.profilePayload)
              .then((r) => r.data);

        await this.$axios.$put(
          '/api/api/v2/my/company-settings',
          this.settings
        );

        if (this.$patchworksAdmin()) {
          await this.updateSubscriptionRequests();
        }
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved company',
          },
          4000
        );
      } catch (error) {
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed saving company profile: ${error}`,
          },
          4000
        );
        if (error.response.status !== 422) {
          throw error;
        }

        this.errors = error.response?.data?.errors || {};
      }
    },
    async updateSubscriptionRequests() {
      const promises = [];
      if (
        this.selectedNonBiSubscription !== null &&
        this.currentNonBiSubscription !== this.selectedNonBiSubscription
      ) {
        promises.push(
          await this.addCompanySubscription(this.selectedNonBiSubscription)
        );
      }
      if (
        this.selectedBiSubscription !== null &&
        this.currentBiSubscription !== this.selectedBiSubscription
      ) {
        promises.push(
          await this.addCompanySubscription(this.selectedBiSubscription)
        );
      }

      if (
        this.currentNonBiSubscription &&
        this.currentNonBiSubscription !== this.selectedNonBiSubscription
      ) {
        promises.push(
          await this.removeCompanySubscription(this.currentNonBiSubscription)
        );
      }
      if (
        this.currentBiSubscription &&
        this.currentBiSubscription !== this.selectedBiSubscription
      ) {
        promises.push(
          await this.removeCompanySubscription(this.currentBiSubscription)
        );
      }

      if (promises.length) {
        await Promise.allSettled(promises).then(() => {
          this.currentNonBiSubscription = this.selectedNonBiSubscription;
          this.currentBiSubscription = this.selectedBiSubscription;
          this.initialise();
        });
      }
    },
    async sendAddSubscriptionRequests() {
      const promises = [];
      if (this.selectedNonBiSubscription !== null) {
        promises.push(
          await this.addCompanySubscription(this.selectedNonBiSubscription)
        );
      }
      if (this.selectedBiSubscription !== null) {
        promises.push(
          await this.addCompanySubscription(this.selectedBiSubscription)
        );
      }

      if (promises.length) {
        await Promise.allSettled(promises).then(() => {
          this.currentNonBiSubscription = this.selectedNonBiSubscription;
          this.currentBiSubscription = this.selectedBiSubscription;
        });
      }
    },
    async addCompanySubscription(subscriptionId) {
      try {
        await this.$axios.$put(
          `/api/api/v2/admin/company/${this.companyProfile.id}/subscription/${subscriptionId}`
        );
      } catch (error) {
        this.$notify({
          group: 'notifications',
          type: 'error',
          text: `Failed updating company subscription: ${error}`,
        });
      }
    },
    async removeCompanySubscription(subscriptionId) {
      try {
        await this.$axios.$delete(
          `/api/api/v2/admin/company/${this.companyProfile.id}/subscription/${subscriptionId}`
        );
      } catch (error) {
        this.$notify({
          group: 'notifications',
          type: 'error',
          text: `Failed updating company subscription: ${error}`,
        });
      }
    },
  },
};
</script>
