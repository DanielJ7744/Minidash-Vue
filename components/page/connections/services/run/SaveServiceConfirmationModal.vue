<template>
  <div>
    <p class="font-medium mb-2">
      This will overwrite the settings and filters of this service with what is
      set on this page.
    </p>
    <p class="font-medium mb-2">
      This could mean that this service no longer picks up the expected records
      or functions as expected.
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
  name: 'SaveServiceConfirmModal',
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
      this.$emit('saveConfirm');
    },
  },
};
</script>
