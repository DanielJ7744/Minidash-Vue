<template>
  <div>
    <div class="mb-2">
      This will restore this custom script to the old values below:
    </div>
    <div
      v-for="(oldValue, oldValueName) in oldValuesToBeRestored"
      :key="oldValueName"
      class="mb-2"
    >
      <template v-if="oldValueName === 'script_code'">
        <div>Script Code</div>
        <MonacoEditor
          :modelValue="oldValue"
          :options="{
            readOnly: true,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on'
          }"
          :lang="scriptLanguage"
          class="h-80 w-full"
        />
      </template>
      <template v-else>
        <div class="grid grid-cols-3">
          <div class="capitalize">
            {{ formatFieldName(oldValueName) }}
          </div>
          <div class="flex items-center justify-center text-lg">
            <div class="icon icon--arrow-right" />
          </div>
          <div>
            {{ oldValue }}
          </div>
        </div>
      </template>
    </div>
    <div class="mb-2">
      This could prevent this script from working and cause any services using
      this script to fail.
    </div>
    <div class="font-medium">
      <label>If you are sure, type 'confirm' below</label>
      <input
        v-model="restoreConfirm"
        type="text"
        class="w-full"
        placeholder="confirm"
      />
    </div>
    <hr />
    <div class="flex justify-between">
      <button type="button" class="button button-secondary" @click="closeModal">
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
  name: 'RestoreAuditVersionModal',
  props: {
    oldValuesToBeRestored: {
      type: Object,
      required: true,
    },
    scriptLanguage: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      restoreConfirm: null,
    };
  },
  computed: {
    hasConfirmed() {
      return this.restoreConfirm === 'confirm';
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal']),
    confirmSave() {
      this.closeModal();
      this.$emit('restoreConfirm');
    },
    formatFieldName(name) {
      return name.replace('_', ' ');
    },
  },
};
</script>
