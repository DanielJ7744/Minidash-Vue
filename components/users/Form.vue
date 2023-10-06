<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <form v-else @submit.prevent="saveUser()">
    <Modal id="deleteConfirmation" title="Are you sure?" classes="modal--small">
      <UsersUserActivateConfirmationModal
        warning-text="Please confirm that you want to de-activate this user."
        @cancel="closeModal"
        @confirm="deleteUser"
      />
    </Modal>
    <UiTitledCard title="General">
      <div>
        <div class="mb-2">
          <label class="mb-2"> Full Name </label>
          <input
            v-model="userName"
            type="text"
            class="w-full"
            min="3"
            max="255"
            pattern="[a-zA-Z0-9 \-&[\]\+_]+"
            title="Name must contain alphanumeric, ampersand, dash and space characters only."
            required
            :disabled="makingRequest || !shouldAllowEditing"
          />
        </div>
        <div>
          <label class="mb-2"> Email </label>
          <input
            v-model="userEmail"
            type="email"
            class="w-full"
            :disabled="makingRequest || !shouldAllowEditing"
            required
          />
        </div>
      </div>
    </UiTitledCard>
    <hr />
    <UiTitledCard title="Roles">
      <FormElement label="Please select from a role below">
        <MultiSelect
          id="user_roles"
          class="w-full"
          v-model="userRoles"
          :options="roles"
          optionLabel="name"
          placeholder="Select roles"
          :loading="makingRequest"
          :disabled="makingRequest || !shouldAllowEditing"
        >
        </MultiSelect>
      </FormElement>
    </UiTitledCard>
    <template v-if="$patchworksAdmin()">
      <hr />
      <UiTitledCard title="Company">
        <label class="mb-2"> Please select a company below </label>
        <div class="mb-2">
          <input
            v-model="companySearchValue"
            type="text"
            placeholder="Search..."
            class="w-full"
          />
        </div>
        <select
          v-if="filteredCompanies"
          v-model="userCompany"
          class="w-full"
          :disabled="makingRequest || !shouldAllowEditing"
        >
          <option
            v-for="company in filteredCompanies"
            :key="`${company.id}+companyList`"
            :value="company.id"
          >
            {{ company.name }}
          </option>
        </select>
        <div v-else>
          No companies found. Please try a different search value
        </div>
      </UiTitledCard>
    </template>
    <hr />
    <div class="flex flex-col-reverse justify-between gap-2 md:flex-row">
      <div class="flex gap-2">
        <button
          v-if="userId && shouldAllowEditing"
          type="button"
          class="button button-danger w-full px-6 md:px-10 lg:whitespace-nowrap"
          :disabled="makingRequest"
          @click="openModal('deleteConfirmation')"
        >
          Deactivate User
        </button>
      </div>
      <div class="flex gap-2">
        <button
          v-if="userId && shouldAllowEditing"
          type="button"
          class="button button-primary w-full px-6 md:px-10 lg:whitespace-nowrap"
          :disabled="makingRequest"
          @click="resetPassword()"
        >
          Reset Password
        </button>
        <button
          v-if="shouldAllowEditing"
          type="submit"
          class="button button-primary w-full px-6 md:px-10"
          :disabled="makingRequest"
        >
          Save
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { mapActions } from 'pinia';
import { showError } from '@/lib/api/error';

export default {
  name: 'UserForm',
  props: {
    userId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      companies: [],
      user: null,
      roles: [],
      userName: null,
      userEmail: null,
      originalRoles: null,
      userRoles: null,
      originalCompany: null,
      userCompany: null,
      companySearchValue: '',
      makingRequest: false,
    };
  },
  async fetch() {
    this.roles = await this.$axios.$get('/api/api/v2/roles').then(function (r) {
      return r.data.map((role) => ({
        name: role.name,
        value: role.id,
      }));
    });

    if (this.userId) {
      const userUrl = this.$patchworksAdmin()
        ? `/api/api/v2/admin/users/${this.userId}`
        : `/api/api/v2/users/${this.userId}`;
      this.user = await this.$axios
        .$get(`${userUrl}?include=company,roles&filter[trashed]=with`)
        .then((r) => r.data);
      this.userName = this.user.name;
      this.userEmail = this.user.email;
      if (this.user.roles.length) {
        this.originalRoles = this.user.roles.map((a) =>
          this.roles.find((b) => b.name === a)
        );
        this.userRoles = this.user.roles.map((a) =>
          this.roles.find((b) => b.name === a)
        );
      }
      this.userCompany = this.user.company.id;
      this.originalCompany = this.user.company.id;
    }
    if (this.$patchworksAdmin()) {
      this.companies = await fetchAllPaginatedResults(
        this.$axios,
        'api/api/v2/patchworks/companies',
        {
          perPage: 100,
        }
      );
    }
  },
  computed: {
    filteredCompanies() {
      return this.companies.filter((row) => {
        if ('name' in row && row.name !== null) {
          return row.name
            .toLowerCase()
            .includes(this.companySearchValue.toLowerCase());
        }
        return row.id;
      });
    },
    shouldAllowEditing() {
      return this.userId ? this.user.deleted_at === null : true;
    },
    userPayload() {
      return {
        name: this.userName,
        email: this.userEmail,
      };
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    async resetPassword() {
      this.makingRequest = true;
      try {
        await this.$axios.$post('/api/api/forgot-password', {
          email: this.userEmail,
        });
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully sent password reset email.',
          },
          4000
        );
      } catch (error) {
        showError(this.$notify, error, 4000);
      }
      this.makingRequest = false;
    },
    async deleteUser() {
      this.makingRequest = true;
      try {
        const url = this.$patchworksAdmin()
          ? `/api/api/v2/admin/users/${this.user.id}`
          : `/api/api/v2/users/${this.user.id}`;
        await this.$axios.$delete(url);
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully deactivated user.',
          },
          4000
        );
      } catch (error) {
        showError(this.$notify, error, 4000);
      }
      this.makingRequest = false;
      this.closeModal();
    },
    async saveUser() {
      if (this.userId) {
        await this.updateUser();
      } else {
        await this.createUser();
      }
    },
    async createUser() {
      this.makingRequest = true;
      try {
        const url = this.$patchworksAdmin()
          ? `/api/api/v2/admin/company/${this.userCompany}/users`
          : '/api/api/v2/users';
        const newUser = await this.$axios
          .$post(url, this.userPayload)
          .then((r) => r.data);

        this.user = {
          id: newUser.id,
        };

        await this.updateRoles();

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully created user.',
          },
          4000
        );

        return navigateTo({
          name: 'user-userId',
          params: {
            userId: newUser.id,
          },
        });
      } catch (error) {
        showError(this.$notify, error, 4000);
      }
      this.makingRequest = false;
    },
    async updateUser() {
      this.makingRequest = true;
      try {
        const url = this.$patchworksAdmin()
          ? `/api/api/v2/admin/users/${this.user.id}`
          : `/api/api/v2/users/${this.user.id}`;
        await this.$axios.$patch(url, this.userPayload);
        if (this.originalCompany !== this.userCompany) {
          await this.$axios.$put(
            `/api/api/v2/patchworks/user/${this.user.id}/company/${this.userCompany}`
          );
        }

        if (this.originalRoles !== this.userRoles) {
          await this.updateRoles();
        }

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully updated user.',
          },
          4000
        );

        navigateTo({
          name: 'user-userId',
          params: {
            userId: this.user.id,
          },
        });
      } catch (error) {
        showError(this.$notify, error, 4000);
      }
      this.makingRequest = false;
    },
    async updateRoles() {
      const roleUrl = this.$patchworksAdmin()
        ? `/api/api/v2/admin/users/${this.user.id}/roles/`
        : `/api/api/v2/users/${this.user.id}/roles/`;

      let originalRoleIds = this.originalRoles?.map((elem) => elem.value);
      let newIds = this.userRoles?.map((elem) => elem.value);

      if (originalRoleIds) {
        let removedRoles = originalRoleIds.filter(
          (elem) => !newIds.includes(elem)
        );
        removedRoles.forEach(
          async (elem) => await this.$axios.$delete(roleUrl + elem)
        );
      }

      if (newIds) {
        let addedRoles = newIds.filter(
          (elem) => !originalRoleIds?.includes(elem)
        );
        addedRoles.forEach(
          async (elem) => await this.$axios.$put(roleUrl + elem)
        );
      }
    },
  },
};
</script>
