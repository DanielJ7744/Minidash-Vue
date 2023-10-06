<template>
  <form @submit.prevent="saveSubscription()">
    <Modal id="deleteConfirmation" title="Are you sure?" classes="modal--small">
      <ModalConfirmDeletion
        warning-text="Please confirm that you want to remove this subscription."
        @deleteCancel="closeModal"
        @deleteConfirm="deleteSubscription"
      />
    </Modal>
    <UiTitledCard title="Subscription Settings">
      <div class="mb-2">
        <label> Name </label>
        <input
          v-model="subscriptionPayload.name"
          type="text"
          placeholder="Please enter a name."
          required
          min="3"
          max="255"
          pattern="[a-zA-Z0-9 ]+$"
          title="Name must contain alphanumeric and space characters only."
          class="w-full"
        />
      </div>
      <div class="mb-2">
        <label> Services </label>
        <input
          v-model="subscriptionPayload.services"
          type="number"
          placeholder="0"
          required
          class="w-full"
        />
      </div>
      <div class="mb-2">
        <label> Transactions </label>
        <input
          v-model="subscriptionPayload.transactions"
          type="number"
          placeholder="0"
          required
          class="w-full"
        />
      </div>
      <div class="mb-2">
        <label> Users </label>
        <input
          v-model="subscriptionPayload.users"
          type="number"
          placeholder="0"
          required
          class="w-full"
        />
      </div>
      <div class="mb-2">
        <label> API Keys </label>
        <input
          v-model="subscriptionPayload.api_keys"
          type="number"
          placeholder="0"
          required
          class="w-full"
        />
      </div>
      <div class="mb-2">
        <label> Price </label>
        <input
          v-model="subscriptionPayload.price"
          type="number"
          placeholder="0"
          required
          class="w-full"
        />
      </div>
      <div class="mb-2">
        <label> SKU </label>
        <input
          v-model="subscriptionPayload.sku"
          type="text"
          placeholder="Please enter a SKU."
          required
          min="3"
          max="255"
          pattern="[a-zA-Z0-9]+$"
          title="SKU must be alphanumeric."
          class="w-full"
        />
      </div>
      <div class="mb-2">
        <label> BI Refresh Rate </label>
        <input
          v-model="subscriptionPayload.bi_refresh_rate"
          type="text"
          placeholder="24 hours"
          class="w-full"
        />
      </div>
      <div class="mb-2">
        <label> Product Type </label>
        <select
          v-model="subscriptionPayload.product_type"
          class="w-full"
          required
        >
          <option value="subscription">Subscription</option>
          <option value="bolton">Bolt-On</option>
          <option value="bi_subscription">BI Subscription</option>
          <option value="bi_bolton">BI Bolt-On</option>
          <option value="stockr">Stockr</option>
        </select>
      </div>
      <div class="flex justify-around">
        <div class="mb-2">
          <label> Default </label>
          <input v-model="subscriptionPayload.default" type="checkbox" />
        </div>
        <div class="mb-2">
          <label> Upgrade </label>
          <input v-model="subscriptionPayload.upgrade" type="checkbox" />
        </div>
        <div class="mb-2">
          <label> Business Insights </label>
          <input
            v-model="subscriptionPayload.business_insights"
            type="checkbox"
          />
        </div>
        <div class="mb-2">
          <label> SFTP </label>
          <input v-model="subscriptionPayload.sftp" type="checkbox" />
        </div>
      </div>
    </UiTitledCard>
    <div
      class="flex"
      :class="!subscription ? 'justify-end' : 'justify-between'"
    >
      <button
        v-if="subscription"
        type="button"
        class="button button-danger"
        :disabled="isMakingRequest"
        @click="openModal('deleteConfirmation')"
      >
        Delete Subscription
      </button>
      <button
        type="submit"
        class="button button-primary"
        :disabled="isMakingRequest"
      >
        {{ subscription ? 'Update' : 'Create' }} Subscription
      </button>
    </div>
  </form>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'ManageSubscriptionForm',
  props: {
    subscription: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      isMakingRequest: false,
      subscriptionPayload: {
        name: '',
        services: 0,
        transactions: 0,
        users: 0,
        api_keys: 0,
        price: 0,
        sku: '',
        bi_refresh_rate: '',
        product_type: '',
        default: false,
        upgrade: false,
        business_insights: false,
        sftp: false,
      },
    };
  },
  mounted() {
    if (this.subscription) {
      this.subscriptionPayload = this.subscription;
    }
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    async deleteSubscription() {
      try {
        this.isMakingRequest = true;
        await this.$axios.$delete(
          `/api/api/v2/admin/subscriptions/${this.subscription.id}`
        );
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully deleted subscription.',
          },
          4000
        );
        this.$emit('subscriptionDeleted');
        this.closeModal();
      } catch (e) {
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to delete subscription: ${e}.`,
          },
          4000
        );
        this.closeModal();
      }
    },
    async saveSubscription() {
      this.isMakingRequest = true;
      try {
        const subscription = this.subscription
          ? await this.$axios
              .$patch(
                `/api/api/v2/admin/subscriptions/${this.subscription.id}`,
                this.subscriptionPayload
              )
              .then((r) => r.data)
          : await this.$axios
              .$post(
                '/api/api/v2/admin/subscriptions',
                this.subscriptionPayload
              )
              .then((r) => r.data);

        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved subscription',
          },
          4000
        );
        this.$emit(
          this.subscription ? 'subscriptionUpdated' : 'subscriptionCreated',
          subscription
        );
      } catch (e) {
        this.isMakingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to save subscription: ${e}.`,
          },
          4000
        );
      }
    },
  },
};
</script>
