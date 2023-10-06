<template>
  <div class="my-5">
    <template v-if="!hasServices">
      <div class="font-medium">
        Please confirm that you want to delete this connector.
      </div>
      <div class="font-medium">
        If you do, this will remove any details related to the connector and you
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
    </template>
    <template v-else>
      <div>
        To delete this connector, you must delete all services using it.
      </div>
      <hr />
      <div class="flex justify-center">
        <button
          type="button"
          class="button button-secondary"
          @click="closeModal()"
        >
          Close
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'DeleteConnectorModal',
  props: {
    hasServices: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal']),
  },
};
</script>
