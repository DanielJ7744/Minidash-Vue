<template>
  <div>
    <div
      class="flex items-center gap-x-1 py-1 text-sm"
      :class="{ 'cursor-pointer': hasChildren }"
      @click="toggleShowChildren"
    >
      <div>
        {{ element.label }}
      </div>
      <div v-if="hasChildren">
        <span
          class="icon"
          :class="{
            'icon--circle-down': showChildren,
            'icon--circle-right': !showChildren,
          }"
        />
      </div>
    </div>
    <template v-if="hasChildren && showChildren">
      <div
        v-for="(childElement, childIndex) in element.children"
        :key="childIndex"
        class="ml-5"
      >
        <EntitiesTreeElement :element="childElement" />
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'TreeElement',
  props: {
    element: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showChildren: true,
    };
  },
  computed: {
    hasChildren() {
      return this.element.children && this.element.children.length > 0;
    },
  },
  methods: {
    toggleShowChildren() {
      this.showChildren = !this.showChildren;
    },
  },
};
</script>
