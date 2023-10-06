<template>
  <div>
    <PageConnectionsSettingsInboundEndpointSettings
      v-if="system.name === 'Inbound Api'"
      :connector="connector"
      :integration="integration"
      :system="system"
    />
    <PageConnectionsSettingsBiSettings
      v-if="system.name === 'BI'"
      :connector="connector"
      :integration="integration"
      :system="system"
    />
    <PageConnectionsSettingsConnectorSettings
      v-else
      :credential="connector"
      :integration="integration"
      :system="system"
    />
  </div>
</template>

<script>
import { systemsHelperMixin } from '@/mixins/system-helper-mixin';

export default {
  name: 'ConnectionSettings',
  mixins: [systemsHelperMixin],
  props: {
    connector: {
      type: Object,
      required: true,
    },
    integration: {
      type: Object,
      required: true,
    },
    system: {
      type: Object,
      required: true,
    },
  },
};
</script>
