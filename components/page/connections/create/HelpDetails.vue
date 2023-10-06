<template>
  <div
    v-if="system.documentation_link_description && system.documentation_link"
  >
    <div
      class="flex max-w-md p-4 mx-auto border rounded bg-gray-200 border-gray-400"
    >
      <div>
        <span class="icon icon--warning mr-2 mt-0.5" />
      </div>
      <div class="space-y-3">
        <p class="text-sm">
          {{ system.documentation_link_description }}
        </p>
        <button
          class="button button-primary button-sm"
          @click="openHelpLink(system.documentation_link)"
        >
          View help
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelpDetails',
  props: {
    system: {
      type: Object,
      required: true,
    },
  },
  methods: {
    openHelpLink(link) {
      window.open(link, '_blank');
    },
  },
};
</script>
