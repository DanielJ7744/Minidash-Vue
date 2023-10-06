<template>
  <div class="relative flex items-center justify-center w-12 rounded aspect-square" :class="{'border-2 ': !system}">
    <UiLoading v-if="loading" />
    <span v-else-if="!loading && !system" class="text-lg icon icon--apps" />
    <SystemIcon
      v-else
      class="rounded"
      :system-name="systemName"
    />
  </div>
</template>

<script>
import { systemsHelperMixin } from '@/mixins/system-helper-mixin'

export default {
  name: 'ServiceIcon',

  mixins: [systemsHelperMixin],
  props: {
    loading: {
      type: Boolean,
      required: false,
      default: false
    },
    system: {
      type: Object,
      required: false,
      default: null
    }
  },
  computed: {
    systemName () {
      return (this.system.name || this.system.attributes.name)
    }
  }
}
</script>
