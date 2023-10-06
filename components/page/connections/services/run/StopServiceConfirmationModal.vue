<template>
  <div>
    <p class="font-medium mb-2">
      If this service is stopped, not all entities picked up will be sent to the
      destination.
    </p>
    <p class="font-medium mb-2">
      This could mean that this service needs to be forced through in future.
    </p>
    <p class="font-medium">
      Please confirm if you want to fully stop this service from running or only
      the most recently started run.
    </p>
    <div class="font-medium">
      <label>If you are sure, type 'confirm' below</label>
      <input
        v-model="deleteConfirm"
        type="text"
        class="w-full"
        placeholder="confirm"
      />
    </div>
    <hr />
    <div class="flex justify-between">
      <button
        type="button"
        class="button button-secondary button-lg"
        @click="closeModal"
      >
        Cancel
      </button>
      <button
        type="button"
        class="button button-danger button-lg"
        :disabled="!hasConfirmed"
        @click="stopService"
      >
        Stop Service
      </button>
      <button
        type="button"
        class="button button-danger button-lg"
        :disabled="!hasConfirmed"
        @click="stopLatestRun"
      >
        {{ stopRunText }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'StopServiceConfirmationModal',
  props: {
    stopRunText: {
      type: String,
      required: false,
      default: 'Stop Latest Run',
    },
  },
  data() {
    return {
      deleteConfirm: null,
    };
  },
  computed: {
    hasConfirmed() {
      return this.deleteConfirm === 'confirm';
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal']),
    stopService() {
      this.closeModal();
      this.$emit('stopService');
    },
    stopLatestRun() {
      this.closeModal();
      this.$emit('stopLatestRun');
    },
  },
};
</script>
