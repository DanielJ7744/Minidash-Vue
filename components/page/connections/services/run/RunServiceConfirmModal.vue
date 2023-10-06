<template>
  <div>
    <p class="font-medium">
      Running this service manually could create duplicate records.
    </p>
    <p v-if="hasIdsToFilter" >
    The service with run with provided IDs, please ensure they are correct.
    </p>
    <p v-if="mergeServiceFilters" >
      The service will run and merge the provided filters with the default filters. Please ensure they are correct.
    </p>
    <p v-else >
    The service will run with the provided filters, please ensure they are correct.
    </p>
    <hr />
    <div class="flex justify-between">
      <button
        type="button"
        class="button button-secondary"
        @click="closeModal"
      >
        Cancel
      </button>
      <button
        type="button"
        class="button button-danger"
        @click="confirmRun"
      >
        Confirm
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'RunServiceConfirmModal',
  props: {
    mergeServiceFilters: {
      type: Boolean,
      required: false,
      default: false,
    },
    hasIdsToFilter: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal']),
    confirmRun() {
      this.closeModal();
      this.$emit('runConfirm');
    },
  },
};
</script>
