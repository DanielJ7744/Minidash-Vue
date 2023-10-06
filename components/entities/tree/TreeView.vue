<template>
  <div class="p-3">
    <div v-if="jsonTree.length">
      <div
        v-for="(treeElement, treeIndex) in jsonTree"
        :key="treeIndex + treeElement.id"
      >
        <EntitiesTreeElement :element="treeElement" />
      </div>
    </div>
    <div v-else>No fields have been detected</div>
  </div>
</template>

<script>
import { traverse } from '@/lib/mapping';

export default {
  name: 'TreeView',
  props: {
    jsonData: {
      type: Object,
      required: false,
      default: null,
    },
  },
  computed: {
    jsonTree() {
      if (!this.jsonData) {
        return [];
      }
      return traverse(this.jsonData);
    },
  },
};
</script>
