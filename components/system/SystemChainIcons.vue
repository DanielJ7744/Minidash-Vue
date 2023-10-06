<template>
  <div class="flex items-center space-x-2">
    <SystemIcon2 :loading="loading" :system="source" class="w-12" />
    <span class="text-xl text-primary icon icon--arrow-right" />
    <SystemIcon2 :loading="loading" :system="destination" class="w-12" />
  </div>
</template>

<script>
import { systemsHelperMixin } from '@/mixins/system-helper-mixin';

export default {
  name: 'SystemChainIcon',
  mixins: [systemsHelperMixin],
  props: {
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    source: {
      type: Object,
      required: false,
      default: null,
    },
    destination: {
      type: Object,
      required: false,
      default: null,
    },
  },
};
</script>
