<template>
  <div>
    <div class="font-medium mb-2">
      This will remove this company profile.
    </div>
    <div class="font-medium mb-2">
      This is unrecoverable and will remove all services, users, company groups
      and access to the dashboard.
    </div>
    <div class="font-medium">
      <label>If you are sure please type 'confirm' below</label>
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
        class="button button-secondary"
        @click="closeModal"
      >
        Cancel
      </button>
      <button
        type="button"
        class="button button-danger"
        :disabled="!hasConfirmed"
        @click="confirmSave"
      >
        Confirm
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'ProfileDeleteConfirmationModal',
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
    confirmSave() {
      this.closeModal();
      this.$emit('deleteConfirm');
    },
  },
};
</script>
