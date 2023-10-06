<template>
  <div>
    <Breadcrumb :current-page="pageTitle" :crumbs="{ Settings: '/settings' }" />

    <PageHeader>
      <template #title>{{ pageTitle }}</template>
    </PageHeader>

    <UiLoading v-if="$fetchState.pending" />

    <template v-else>
      <UiTitledCard title="General">
        <label>Name</label>
        <input
          v-model="userName"
          type="text"
          class="w-full"
          min="3"
          max="255"
          pattern="[a-zA-Z0-9 \-&[\]\+_]+"
          title="Name must contain alphanumeric, ampersand, dash and space characters only."
          required
          :disabled="makingRequest"
        />
        <label>Email</label>
        <input
          v-model="userEmail"
          type="email"
          class="w-full"
          required
          :disabled="makingRequest"
        />
      </UiTitledCard>
      <hr />
      <div class="flex justify-between">
        <div>
          <NuxtLink
            :to="{
              path: '/settings',
            }"
          >
            <button
              type="button"
              class="button button-secondary"
              :disabled="makingRequest"
            >
              Cancel
            </button>
          </NuxtLink>
        </div>
        <div>
          <button
            type="button"
            class="button button-primary"
            :disabled="makingRequest"
            @click="saveUser()"
          >
            Save
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'AccountSettings',
  data() {
    return {
      user: null,
      pageTitle: 'Account Settings',
      userName: null,
      userEmail: null,
      makingRequest: false,
    };
  },
  async fetch() {
    this.user = await this.$axios
      .$get(`/api/api/v2/users/${this.userId}`)
      .then(r => r.data);
    this.userName = this.user.name;
    this.userEmail = this.user.email;
  },
  computed: {
    userId() {
      return this.$auth.user ? this.$auth.user.id : null;
    },
  },
  methods: {
    async saveUser() {
      try {
        this.makingRequest = true;
        const updateData = {
          name: this.userName,
          email: this.userEmail,
        };
        await this.$axios.$put(`/api/api/v2/users/${this.userId}`, updateData);
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Saved new details successfully',
          },
          4000
        );
        navigateTo({name: 'settings'});
        this.makingRequest = false;
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to save new details: ${error}`,
          },
          4000
        );
        this.makingRequest = false;
      }
    },
  },
};
</script>
