<template>
  <div class="p-1">
    <div class="mb-2 font-medium">
      {{ warningText }}
    </div>
    <div class="font-medium">
      <FormElement
        v-model="deleteConfirm"
        title="delete-confirm"
        label="If you are sure, type 'confirm' below"
        required
        v-slot="{ inputProps, inputEvents }"
      >
        <input
          type="text"
          class="w-full"
          placeholder="confirm"
          v-bind="inputProps"
          v-on="inputEvents"
        />
      </FormElement>
    </div>
    <div class="mt-2 flex justify-between">
      <button
        type="button"
        class="button button-secondary"
        @click="$emit('deleteCancel')"
      >
        Cancel
      </button>
      <button
        type="button"
        class="button button-danger"
        :disabled="deleteConfirm !== 'confirm'"
        @click="$emit('deleteConfirm')"
      >
        Confirm
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'DeleteConfirmationModal',
  props: {
    warningText: {
      type: String,
      required: true,
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
