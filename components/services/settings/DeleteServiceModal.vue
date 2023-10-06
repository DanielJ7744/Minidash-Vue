<template>
  <div>
    <template v-if="!service.status">
      <p class="font-medium">
        Please confirm that you want to delete this service.
      </p>
      <p>
        If you do, this will remove the service and you will need to set it up
        again.
      </p>
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
          @click="confirmDelete()"
        >
          Confirm
        </button>
      </div>
    </template>
    <template v-else>
      <div class="font-medium">
        To delete this service you need to de-activate it first.
      </div>
      <hr />
      <div class="flex justify-center">
        <button
          type="button"
          class="button button-secondary"
          @click="closeModal()"
        >
          Go back
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'DeleteServiceModal',
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal']),
    confirmDelete() {
      this.$emit('delete');
      this.closeModal();
    },
  },
};
</script>
