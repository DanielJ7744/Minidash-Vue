<template>
  <div>
    <div class="flex flex-col mb-3 font-medium">
      <div>You currently have no active filters on this service.</div>
      <div>
        Running a service without any filters may result in service failure and
        increased transaction volume.
      </div>
    </div>
    <div class="flex justify-between">
      <button
        type="button"
        class="button button-primary"
        @click="confirm()"
      >
        Yes
      </button>
      <button
        type="button"
        class="button button-secondary"
        @click="cancel()"
      >
        No
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'EmptyFilterWarning',
  methods: {
    ...mapActions(useUiStore, ['closeModal']),
    confirm() {
      this.$emit('confirm');
      this.closeModal();
    },
    cancel() {
      this.$emit('cancel');
      this.closeModal();
    },
  },
};
</script>
