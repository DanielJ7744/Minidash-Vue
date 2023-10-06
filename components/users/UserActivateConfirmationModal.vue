<template>
  <div>
    <div class="font-medium mb-2">
      {{ warningText }}
    </div>
    <div v-if="isActivate" class="font-medium mb-2">
      Activating a user restores their access to the dashboard along with the
      permissions they had when they were de-activated.
    </div>
    <div v-else class="font-medium mb-2">
      De-activating a user removes their access to the dashboard, preventing
      them from accessing it again.
    </div>
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
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="button"
        class="button button-danger"
        :disabled="deleteConfirm !== 'confirm'"
        @click="$emit('confirm')"
      >
        Confirm
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'UserActivateConfirmationModal',
  props: {
    warningText: {
      type: String,
      required: true,
    },
    isActivate: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      deleteConfirm: null,
    };
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal']),
  },
};
</script>
