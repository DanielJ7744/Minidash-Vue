<template>
  <FlowStepBase
    :step="step"
    :icon="flowShapeMeta.connector.icon"
    container-class="border-sky-300 hover:border-sky-500"
    header-class="bg-sky-50"
    title-class="text-sky-700"
    shadow-class="shadow-sky-100"
  >
    <template #title>Connector</template>

    <template #content>
      <div class="flex items-center space-x-3">
        <SystemIcon :systemName="systemName" class="w-10 rounded" />
        <div>
          <div>
            <p class="text-xs text-gray-400">Orders</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">Smiths SF-EU</p>
          </div>
        </div>
      </div>
    </template>

    <template #sidebar>
      <FlowStepConnectorSettings />
    </template>
  </FlowStepBase>
</template>

<script setup lang="ts">
import { flowShapeMeta } from '@/types/core/v1';
import type { FlowStep } from '@/types/core/v1';

defineProps<{
  step: FlowStep;
}>();

const systems = [
  '3pl',
  'amazon',
  'bi',
  'bigcommerce',
  'bleckmann',
  'brightpearl',
  'cegid',
  'channelunity',
  'clover',
  'commercetools',
  'csv',
  'cybertill',
  'demandware',
  'dynamics_nav',
  'dynamicsnav',
  'emarsys',
  'eposnow',
  'farfetch',
  'fashionmaster',
  'globale',
  'inbound_api',
  'inboundapi',
  'joor',
  'json',
  'khaos',
  'kuehnenagel',
  'lightspeed',
  'linnworks',
  'magento',
  'mirakl',
  'netsuite',
  'ometria',
  'ometriafilepull',
  'opsuite',
  'patchworks',
  'peoplevox',
  'plytix',
  'prestashop',
  'prima_solutions',
  'radial',
  'rebound',
  's3',
  'sage',
  'salesforce',
  'sap_business_one',
  'sap',
  'seko_api',
  'seko',
  'sftp',
  'shopify',
  'shopifyplus',
  'sitoo',
  'snapfulfil',
  'spark_layer',
  'syteline',
  'tiktok_shop',
  'toll',
  'torque',
  'txt',
  'veeqo',
  'visual2000',
  'visualnext',
  'visualsoft',
  'volusion',
  'voyado',
  'woocommerce',
  'xero',
  'xml',
  'xstore',
  'yotpo',
  'zigzag',
];

const systemName = systems[Math.floor(Math.random() * systems.length)];
</script>
