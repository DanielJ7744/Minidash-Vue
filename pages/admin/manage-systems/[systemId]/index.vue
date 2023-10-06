<template>
  <div>
    <Breadcrumb
      current-page="Manage System"
      :crumbs="{ 'All Systems': '/admin/manage-systems' }"
    />
    <UiLoading v-if="$fetchState.pending" />
    <div v-else-if="$fetchState.error" class="relative h-36">
      <UiError message="An error occurred." />
    </div>
    <template v-else>
      <PageHeader>
        <template #title>Manage {{ system.name }}</template>
        <template #description
          >Use this page to manage {{ system.name }}.</template
        >
      </PageHeader>
      <hr />
      <SystemManageSystemForm
        :system="system"
        @systemCreated="redirectToSystem"
        @systemDeleted="redirectToSystems"
        @systemUpdated="redirectToSystems"
        @cancel="redirectToSystems"
      />
    </template>
  </div>
</template>

<script>
definePageMeta({
  can: 'manage systems',
});

export default {
  name: 'Index',
  setup() {
    return {
      route: useRoute(),
    };
  },
  data() {
    return {
      system: null,
    };
  },
  async fetch() {
    this.system = await this.$axios
      .$get(`/api/api/v2/systems/${this.systemId}`)
      .then((r) => r.data);
  },
  computed: {
    systemId() {
      return this.route.params.systemId;
    },
  },
  methods: {
    redirectToSystems() {
      navigateTo({ name: 'admin-manage-systems' });
    },
    redirectToSystem(system) {
      navigateTo({
        name: 'admin-manage-systems-systemId',
        params: { systemId: system.id },
      });
    },
  },
};
</script>
