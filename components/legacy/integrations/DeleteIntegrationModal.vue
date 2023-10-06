<template>
  <div>
    <div class="font-medium">
      Please confirm that you want to delete this profile.
    </div>
    <div class="font-medium">
      If you do, this will remove any details related to the profile and you
      will have to set it up again.
    </div>
    <hr />
    <div class="flex justify-between">
      <button
        type="button"
        class="button button-secondary"
        @click="closeModal()"
      >
        Cancel
      </button>
      <button
        type="button"
        class="button button-danger"
        @click="$emit('delete')"
      >
        Confirm
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'DeleteIntegrationModal',
  methods: {
    ...mapActions(useUiStore, ['closeModal']),
  },
};
</script>
