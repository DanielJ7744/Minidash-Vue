<template>
  <div>
    <PageHeader>
      <template #title> Payload Script </template>
    </PageHeader>
    <PageConnectionsServicesPayloadScriptCustomScriptSelector
      :custom-script-id="customScriptId"
      :service="service"
    />
  </div>
</template>

<script>
definePageMeta({
  middleware: ['custom-scripts'],
});

export default {
  name: 'PayloadScript',
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
  computed: {
    customScriptId() {
      return this.service?.settings?.custom_script_id;
    },
  },
};
</script>
