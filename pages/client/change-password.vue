<template>
  <div class="password_change_wrapper">
    <UiCard title="Change password" class="max-w-3xl mx-auto">
      <form
        class="space-y-5"
        :class="{ submitting: loading }"
        @submit.prevent="handleSubmit"
      >
        <div v-if="hasError" id="validation-errors">
          <div
            v-for="[field, fieldErrors] in Object.entries(errors)"
            :key="field"
          >
            <p
              v-for="(error, idx) in fieldErrors"
              :key="idx"
              class="text-sm m-0 text-red-500"
            >
              * {{ error }}
            </p>
          </div>
        </div>
        <FormElement
          v-model="form.current_password"
          title="current_password"
          label="Current password"
          :errors="errors"
          required
          v-slot="{ inputProps, inputEvents }"
        >
          <input
            type="password"
            maxlength="255"
            v-bind="inputProps"
            v-on="inputEvents"
          />
        </FormElement>

        <FormElement
          v-model="form.password"
          title="password"
          label="New password"
          :errors="errors"
          required
          v-slot="{ inputProps, inputEvents }"
        >
          <input
            type="password"
            maxlength="255"
            v-bind="inputProps"
            v-on="inputEvents"
          />
        </FormElement>

        <FormElement
          v-model="form.password_confirmation"
          title="password_confirmation"
          label="Confirm new password"
          :errors="errors"
          required
          v-slot="{ inputProps, inputEvents }"
        >
          <input
            type="password"
            maxlength="255"
            v-bind="inputProps"
            v-on="inputEvents"
          />
        </FormElement>

        <button
          type="submit"
          class="button button-primary"
          :disabled="loading"
        >
          Submit
        </button>
      </form>
    </UiCard>
  </div>
</template>

<script>
export default {
  name: 'ChangePassword',
  data() {
    return {
      form: {
        current_password: '',
        password: '',
        password_confirmation: '',
      },
      loading: false,
      errors: {},
    };
  },
  computed: {
    hasError() {
      return Object.keys(this.errors).length;
    },
  },
  methods: {
    async handleSubmit() {
      this.loading = true;

      try {
        await this.$axios.put('/api/api/v2/my/password', this.form);

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Password changed successfully',
          },
          4000
        );
        navigateTo({ name: 'index' });
      } catch (error) {
        this.errors = error.response.data?.errors || {};
      }

      this.loading = false;
    },
  },
};
</script>
