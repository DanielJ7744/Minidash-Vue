<template>
  <div class="page-container-fluid page-container space-y-5">
    <div class="mb-16">
      <ChartMonthlyTransactions :service="service" />
    </div>
    <hr />
    <div class="h6 py-2">Syncs</div>
    <div>
      <TableServiceLogs
        :service-ids="[service.id]"
        :integration-is-on-k8s="integrationIsOnK8s"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Syncs',
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
  computed: {
    integrationIsOnK8s() {
      return this.service.integration.server.endsWith('-k8s');
    },
  },
};
</script>
