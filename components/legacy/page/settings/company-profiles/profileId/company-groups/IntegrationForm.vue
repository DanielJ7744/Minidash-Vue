<template>
  <div>
    <UiLoading
      v-if="$fetchState.pending || isMakingRequest"
      class="relative h-36"
    />
    <UiError
      v-else-if="$fetchState.error"
      class="relative h-36"
      message="An error occurred."
    />
    <form v-else @submit.prevent="saveGroup">
      <Modal
        id="deleteConfirmation"
        title="Are you sure?"
        classes="modal--small"
      >
        <LegacyPageSettingsCompanyProfilesProfileIdCompanyGroupsGroupDeleteConfirmationModal
          @deleteConfirm="deleteGroup"
        />
      </Modal>

      <UiTitledCard title="General">
        <div>
          <label>Group name</label>
          <input
            v-model="groupName"
            type="text"
            placeholder="Please enter a group name"
            required
            min="1"
            max="255"
            pattern="[a-zA-Z0-9 \-&]+"
            title="Name must contain alphanumeric, ampersand, dash and space characters only."
            class="w-full"
            :disabled="isMakingRequest"
          />
        </div>
        <div v-if="selectableIntegrations.length">
          <label> Parent Group </label>
          <select
            v-model="parentIntegration"
            class="w-full"
            :disabled="isMakingRequest"
          >
            <option
              v-for="companyIntegration in selectableIntegrations"
              :key="companyIntegration.id"
              :value="companyIntegration.id"
            >
              {{ companyIntegration.name }}
            </option>
          </select>
        </div>
      </UiTitledCard>
      <hr />
      <UiTitledCard title="Users">
        <label>Add/Remove Users</label>
        <div class="h-2/4 overflow-y-auto border p-2">
          <div
            v-for="(user, userIndex) in viewableUsers"
            :key="`userList_${userIndex}`"
            class="mb-2 flex items-center gap-x-1"
          >
            <input
              :checked="user.checked"
              :disabled="isMakingRequest"
              type="checkbox"
              @click="addSelectedUserToList($event, user)"
            />
            <label>{{ user.name + ' (' + user.email + ')' }}</label>
          </div>
        </div>
      </UiTitledCard>
      <template v-if="canShowMapLinks">
        <hr />
        <UiTitledCard title="Shipment and Payment Maps">
          <div class="flex items-center justify-around">
            <NuxtLink
              v-if="shipmentMap"
              tag="button"
              class="button button-primary"
              :to="{
                name: $patchworksAdmin()
                  ? 'admin-company-profiles-profileId-company-groups-companyGroupId-shipment-map'
                  : 'settings-company-profile-profileId-company-groups-companyGroupId-shipment-map',
                params: { profileId, companyGroupId: companyGroup.id },
              }"
            >
              Manage Shipment Map
            </NuxtLink>
            <NuxtLink
              v-if="paymentMap"
              tag="button"
              class="button button-primary"
              :to="{
                name: $patchworksAdmin()
                  ? 'admin-company-profiles-profileId-company-groups-companyGroupId-payment-map'
                  : 'setting-company-profile-profileId-company-groups-companyGroupId-payment-map',
                params: { profileId, companyGroupId: companyGroup.id },
              }"
            >
              Manage Payment Map
            </NuxtLink>
          </div>
        </UiTitledCard>
      </template>
      <hr />
      <div class="flex justify-between">
        <div>
          <button
            type="button"
            :disabled="!companyGroup || isMakingRequest"
            class="button button-danger"
            @click="openModal('deleteConfirmation')"
          >
            Delete
          </button>
        </div>
        <div>
          <button
            :disabled="isMakingRequest"
            type="submit"
            class="button button-primary"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'IntegrationForm',
  props: {
    companyGroupId: {
      type: Number,
      required: false,
      default: null,
    },
    profileId: {
      type: Number,
      required: true,
      default: null,
    },
  },
  data() {
    return {
      companyGroup: null,
      companyProfile: null,
      allUsers: [],
      integrationUsers: [],
      groupName: null,
      parentIntegration: null,
      companyGroups: [],
      shipmentMap: null,
      paymentMap: null,
      usersToSend: [],
      selectedUsers: [],
      uncheckedUsers: [],
      viewableUsers: [],
      isMakingRequest: false,
      mapError: null,
    };
  },
  async fetch() {
    const url = this.$patchworksAdmin()
      ? '/api/api/v2/admin/users'
      : '/api/api/v2/users';
    const filters = this.$patchworksAdmin()
      ? { 'filter[company_id]': this.profileId }
      : {};

    this.allUsers = await fetchAllPaginatedResults(this.$axios, url, filters);

    this.companyProfile = this.$patchworks()
      ? await this.$axios
          .$get(`/api/api/v2/patchworks/companies/${this.profileId}`)
          .then((r) => r.data)
      : await this.$axios.$get('/api/v2/my/company').then((r) => r.data);

    if (!this.companyGroupId) {
      this.viewableUsers = this.allUsers;
    }

    if (this.companyGroupId) {
      this.companyGroup = this.$patchworksAdmin()
        ? await this.$axios
            .$get(
              `/api/v2/admin/integrations/${this.companyGroupId}?include=users`
            )
            .then((r) => r.data)
        : await this.$axios
            .$get(`/api/v2/integrations/${this.companyGroupId}?include=users`)
            .then((r) => r.data);

      this.groupName = this.companyGroup.name;
      this.integrationUsers = this.companyGroup.users;
      this.parentIntegration = this.companyGroup.parent_id;
      this.populateViewableUsers();
      await this.loadShipmentMap();
      await this.loadPaymentMap();
    }

    const params = this.$patchworksAdmin()
      ? { 'filter[company_id]': this.profileId }
      : {};
    this.companyGroups = await fetchAllPaginatedResults(
      this.$axios,
      this.$patchworksAdmin()
        ? '/api/v2/admin/integrations'
        : '/api/api/v2/integrations',
      params
    );
  },
  computed: {
    payload() {
      const payload = {
        active: 1,
        name: this.groupName,
        username: `${this.companyProfile.name} ${this.groupName}`,
        company_id: this.profileId ?? this.currentCompany.id,
      };

      if (this.parentIntegration) {
        payload.parent_id = this.parentIntegration;
      }

      return payload;
    },
    selectableIntegrations() {
      return this.companyGroups.filter(
        (companyIntegration) => companyIntegration.id !== this.companyGroup?.id
      );
    },
    canShowMapLinks() {
      const hasValidShipmentMap =
        this.shipmentMap !== null && this.shipmentMap !== '[]';
      const hasValidPaymentMap =
        this.paymentMap !== null && this.paymentMap !== '[]';
      return (
        this.companyGroup !== null &&
        (hasValidShipmentMap || hasValidPaymentMap)
      );
    },
  },
  mounted() {
    if (
      this.companyGroups.length > 5 &&
      !this.companyGroup &&
      !this.$patchworksAdmin()
    ) {
      this.$notify(
        {
          group: 'notifications',
          type: 'error',
          text: 'You already have the maximum amount of company groups for your subscription',
        },
        4000
      );
      if (this.profileId) {
        navigateTo({
          name: 'settings-company-profile-profileId',
          params: {
            profileId: this.profileId,
          },
        });
      } else {
        navigateTo({ name: 'settings' });
      }
    }
  },
  methods: {
    // ...mapActions( 'ui', ['openModal']),
    populateViewableUsers() {
      this.allUsers.forEach((user) => {
        const mutableUser = Object.assign({}, user);
        const matchingCheckedUser = this.integrationUsers.find(
          (integrationUser) =>
            parseInt(integrationUser.id) === parseInt(user.id)
        );
        if (matchingCheckedUser) {
          mutableUser.checked = true;
          this.viewableUsers.push(mutableUser);
          this.selectedUsers.push(mutableUser.id);
        } else {
          this.viewableUsers.push(user);
        }
      });
    },
    async loadShipmentMap() {
      try {
        this.shipmentMap = await this.$axios
          .$get(`/api/v2/integrations/${this.companyGroup.id}/shipment-maps`)
          .then((r) => r.data);
      } catch (error) {
        this.mapError = error;
      }
    },
    async loadPaymentMap() {
      try {
        this.paymentMap = await this.$axios
          .$get(`/api/api/v2/integrations/${this.companyGroup.id}/payment-maps`)
          .then((r) => r.data);
      } catch (error) {
        this.mapError = error;
      }
    },
    addSelectedUserToList(event, user) {
      if (event.target.checked === true) {
        this.usersToSend.push(user.id);
        this.selectedUsers.push(user.id);
        const uncheckedUserIndex = this.uncheckedUsers.findIndex(
          (uncheckedUser) => parseInt(uncheckedUser) === parseInt(user.id)
        );
        if (uncheckedUserIndex !== -1) {
          this.uncheckedUsers.splice(uncheckedUserIndex, 1);
        }
      } else {
        const selectedUserIndex = this.selectedUsers.findIndex(
          (selectedUser) => parseInt(selectedUser) === parseInt(user.id)
        );
        if (selectedUserIndex !== -1) {
          if (this.companyGroup) {
            this.uncheckedUsers.push(user.id);
          }
          this.selectedUsers.splice(selectedUserIndex, 1);
        }
      }
    },
    async saveGroup() {
      try {
        this.isMakingRequest = true;
        if (this.companyGroup) {
          this.removeUsersFromGroup();
          this.companyGroup = this.$patchworksAdmin()
            ? await this.$axios
                .$patch(
                  `/api/v2/admin/integrations/${this.companyGroup.id}`,
                  this.payload
                )
                .then((r) => r.data)
            : await this.$axios
                .$patch(
                  `/api/v2/integrations/${this.companyGroup.id}`,
                  this.payload
                )
                .then((r) => r.data);
        } else {
          this.companyGroup = this.$patchworksAdmin()
            ? await this.$axios
                .$post('/api/v2/admin/integrations', this.payload)
                .then((r) => r.data)
            : await this.$axios
                .$post('/api/v2/integrations', this.payload)
                .then((r) => r.data);
        }

        if (this.usersToSend.length !== 0) {
          Promise.allSettled(
            this.getIntegrationUserPromises(
              this.usersToSend,
              this.companyGroup.id
            )
          ).then((results) => {
            this.usersToSend = [];
            this.handlePromiseResponses(results);
          });
        }

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Company group has been saved successfully',
          },
          4000
        );
        navigateTo({
          name: this.$patchworksAdmin()
            ? 'admin-company-profile-profileId'
            : 'settings-company-profile-profileId',
          params: {
            profileId: this.profileId,
          },
        });

        this.isMakingRequest = false;
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to save the group: ${error}`,
          },
          4000
        );
        this.isMakingRequest = false;
      }
    },
    removeUsersFromGroup() {
      const promises = [];
      this.uncheckedUsers.forEach((userId) => {
        if (this.$patchworksAdmin()) {
          promises.push(
            this.$axios.$delete(
              `/api/v2/admin/integrations/${this.companyGroup.id}/users/${userId}`
            )
          );
        } else {
          promises.push(
            this.$axios.$delete(
              `/api/v2/integrations/${this.companyGroup.id}/users/${userId}`
            )
          );
        }
      });
      Promise.allSettled(promises).then((results) => {
        this.handlePromiseResponses(results);
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Removed users from group successfully',
          },
          4000
        );
      });
    },
    async deleteGroup() {
      try {
        this.isMakingRequest = true;
        this.$patchworksAdmin()
          ? await this.$axios.$delete(
              `/api/v2/admin/integrations/${this.companyGroup.id}`
            )
          : await this.$axios.$delete(
              `/api/v2/integrations/${this.companyGroup.id}`
            );

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Company group has been deleted successfully',
          },
          4000
        );
        this.isMakingRequest = false;
        navigateTo({
          name: this.$patchworksAdmin()
            ? 'admin-company-profiles-profileId'
            : 'settings-company-profile-profileId',
          params: {
            profileId: this.profileId,
          },
        });
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to delete the group: ${error}`,
          },
          4000
        );
        this.isMakingRequest = false;
      }
    },
    getIntegrationUserPromises(userIds, integrationId) {
      const promises = [];
      userIds.forEach((userId) => {
        if (this.$patchworksAdmin()) {
          promises.push(
            this.$axios.$post(
              `/api/v2/admin/integrations/${integrationId}/users`,
              { user_id: userId }
            )
          );
        } else {
          promises.push(
            this.$axios.$post(
              `/api/api/v2/integrations/${integrationId}/users`,
              {
                user_id: userId,
              }
            )
          );
        }
      });
      return promises;
    },
    handlePromiseResponses(results) {
      const failedPromises = [];
      results.forEach((result) => {
        if (result.status !== 'fulfilled') {
          failedPromises.push(result);
        }
      });
      failedPromises.forEach((failedResponse) => {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: failedResponse.reason.message,
          },
          4000
        );
      });
    },
  },
};
</script>
