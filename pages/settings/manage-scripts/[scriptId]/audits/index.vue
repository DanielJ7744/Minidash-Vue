<template>
  <div>
    <Breadcrumb
      current-page="Script Audits"
      :crumbs="{ 'Manage Script': `/settings/manage-scripts/${scriptId}` }"
    />
    <PageHeader>
      <template #title>Script Audits</template>
    </PageHeader>

    <hr />

    <UiLoading v-if="$fetchState.pending" class="relative h-36" />
    <UiError
      v-else-if="$fetchState.error"
      class="relative h-36"
      message="An error occurred."
    />
    <PageSettingsManageScriptsAuditsCustomScriptAuditLogs
      v-else
      :audits="audits"
      :script="script"
    />
  </div>
</template>

<script>
definePageMeta({
  middleware: ['custom-scripts'],
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
      script: null,
      audits: null,
    };
  },
  async fetch() {
    this.script = await this.$axios
      .$get(`${this.url}/${this.scriptId}?include=audits`)
      .then((r) => r.data);
    this.audits = this.script.audits;
  },
  computed: {
    url() {
      return `/api/api/v1/transform-scripts/company/${this.$auth.user.company_id}/custom_scripts`;
    },
    scriptId() {
      return this.route.params.scriptId;
    },
  },
};
</script>
