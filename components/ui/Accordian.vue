<template>
  <div class="rounded border">
    <div class="rounded p-2 flex justify-between cursor-pointer" @click="toggle()">
      <slot name="header" />
      <div class="transition-transform flex-shrink flex items-center md:border-0"
           :class="{'rotate-90 border-0': expanded, 'border-l': !expanded}">
        <span class="button button-sm inline-block">❯</span>
      </div>
    </div>
    <div
      class="transition-all duration-400 relative"
      :class="{ 'max-h-0 overflow-hidden': !expanded, 'max-h-auto': expanded }"
    >
      <slot />
    </div>
  </div>
</template>

<script>
import { v4 as uuid } from 'uuid';

export default {
  name: 'Accordian',
  props: {
    id: {
      type: String,
      required: false,
      default: () => uuid()
    },
    expandByDefault: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      expanded: false
    };
  },
  mounted() {
    this.expanded = this.expandByDefault;
  },
  methods: {
    toggle() {
      this.expanded = !this.expanded;
      this.$emit('toggled', this.expanded);
    }
  }
};
</script>
