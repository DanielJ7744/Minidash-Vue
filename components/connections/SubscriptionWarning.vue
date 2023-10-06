<template>
  <div class="space-y-5">
    <div>
      You'll need to upgrade your tier for this {{ preventedFromAdding }}.
    </div>
    <div class="flex justify-end">
      <button
        type="button"
        class="button button-primary"
        @click="closeModal()"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'SubscriptionWarning',
  props: {
    preventedFromAdding: {
      type: String,
      required: true,
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal']),
  },
};
</script>
