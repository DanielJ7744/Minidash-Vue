<template>
  <div class="mr-3">
    <div class="sm:flex sm:items-start">
      <div
        class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
      >
        <!-- Heroicon name: outline/exclamation-triangle -->
        <svg
          class="h-6 w-6 text-red-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <div
        class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full"
      >
        <h3 class="text-lg font-medium leading-6 text-gray-900">
          {{ warningText }}
        </h3>
        <div class="mt-2">
          <div v-if="deleteExplanation" class="mb-2">
            {{ deleteExplanation }}
          </div>
          <div class="">
            <p class="text-gray-500">{{ confirmationLabel }}</p>
            <input
              v-model="deleteConfirm"
              type="text"
              class="w-full mt-2"
              placeholder="confirm"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
      <button
        type="button"
        class="button button-danger w-full sm:ml-3 sm:w-auto"
        :disabled="deleteConfirm !== 'confirm'"
        @click="$emit('deleteConfirm')"
      >
        Delete
      </button>
      <button
        type="button"
        class="button button-secondary mt-3 w-full sm:mt-0 sm:w-auto"
        @click="$emit('deleteCancel')"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    warningText: {
      type: String,
      required: true,
    },
    deleteExplanation: {
      type: String,
      required: false,
      default: null,
    },
    confirmationLabel: {
      type: String,
      required: false,
      default: "If you are sure, type 'confirm' below to continue",
    },
  },
  data() {
    return {
      deleteConfirm: null,
    };
  },
};
</script>
