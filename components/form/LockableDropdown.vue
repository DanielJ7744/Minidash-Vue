<template>
  <div class="space-y-1">
    <label v-if="label" :for="title">
      {{ label }} <span v-if="required" class="text-danger-500">*</span>
    </label>

    <div class="flex items-center gap-x-3">
      <select
        :value="modelValue"
        class="w-full bg-white"
        :disabled="preventDropdownChange"
        @change="handleChange"
      >
        <option :value="null" disabled selected>Please select...</option>
        <option v-for="option in dropdownOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
      <span
        class="text-base cursor-pointer icon"
        :class="{
          'icon--lock': preventDropdownChange,
          'icon--unlocked': !preventDropdownChange,
        }"
        @click="openModal('dropdownChangeConfirmation')"
      />
    </div>

    <div v-if="errors[title]">
      <p class="text-xs text-danger-600">
        {{ errors[title][0] }}
      </p>
    </div>

    <Modal
      id="dropdownChangeConfirmation"
      title="Are you sure?"
      classes="modal--small"
    >
      <LegacyDeleteConfirmationModal
        :warning-text="dropdownConfirmationTextOptions.warning_text"
        :delete-explanation="dropdownConfirmationTextOptions.explanation_text"
        :confirmation-label="dropdownConfirmationTextOptions.confirmation_text"
        @deleteCancel="closeModal"
        @deleteConfirm="allowDropdownChange"
      />
    </Modal>
  </div>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'LockableDropdown',
  props: {
    title: {
      type: String,
      required: true,
    },
    required: {
      type: Boolean,
      required: false,
      default: false,
    },
    label: {
      type: String,
      required: false,
      default: null,
    },
    modelValue: {
      type: [String, Number, null],
      required: false,
      default: null,
    },
    dropdownOptions: {
      type: Array,
      required: true,
    },
    errors: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    dropdownConfirmationTextOptions: {
      type: Object,
      required: false,
      default: () => ({
        warning_text:
          'Changing the currently selected script language will remove the code currently in the editor.',
        explanation_text:
          'If you need the current code or do not need to change the script language, please cancel this.',
        confirmation_text:
          "If you are sure you want to do this, please type 'confirm' in the box below then use the dropdown to change the language.",
      }),
    },
    lockDropdown: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      preventDropdownChange: false,
    };
  },
  mounted() {
    this.preventDropdownChange = this.lockDropdown;
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    handleChange(event) {
      this.$emit('update:modelValue', event.currentTarget.value);
      this.preventDropdownChange = true;
    },
    allowDropdownChange() {
      this.closeModal();
      this.preventDropdownChange = false;
    },
  },
};
</script>
