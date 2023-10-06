<template>
  <div class="p-4 rounded bg-gray-50 sm:px-6">
    <div v-if="loading" class="relative h-12">
      <UiLoading />
    </div>

    <template v-else>
      <p class="m-0 mb-2 text-base text-gray-700">
        Choose a secure password:
      </p>
      <div class="space-y-2 xs:space-y-1">
        <div
          v-for="rule in invalidValidationRules"
          :key="rule.rule"
          class="flex items-center ml-2 space-x-1"
          :class="[
            !attempted
              ? 'text-gray-600'
              : rule.invalid
              ? 'text-red-600'
              : 'text-success-600',
          ]"
        >
          <div class="flex items-center shrink-0">
            <!-- Right arrow -->
            <svg
              v-if="!attempted"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 aspect-square"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <!-- Cross -->
            <svg
              v-else-if="rule.invalid"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 aspect-square"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <!-- Checkmark -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 aspect-square"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="ml-0">
            <p class="text-xs">
              {{ rule.rule.replace('The password must', 'Must ') }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'PasswordValidationStatus',
  props: {
    errors: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  data() {
    return {
      loading: true,
      validationRules: [],
    };
  },

  async mounted() {
    try {
      await useFabric('/api/reset-password', {
        method: 'POST',
        body: { password: 'p' },
      });
    } catch (error) {
      this.validationRules = error.response._data?.errors.password.filter(
        rule => !rule.includes('confirmation')
      );
    } finally {
      this.loading = false;
    }
  },
  computed: {
    invalidValidationRules() {
      return this.validationRules.map(rule => ({
        rule,
        invalid: this.errors.password?.includes(rule) || false,
      }));
    },
    attempted() {
      return !!Object.entries(this.errors).length;
    },
  },
};
</script>
