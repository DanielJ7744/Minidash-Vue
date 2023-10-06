<template>
  <div class="border rounded">
    <div
      v-if="!hideHeader"
      class="bg-gray-200 p-2 flex justify-between text-gray-800 items-center"
    >
      <slot name="header" />
      <div>
        <span
          v-if="controlsType === 'cog'"
          class="icon icon--cog"
          @click="cogClicked"
        />
        <template v-else-if="controlsType === 'arrows'">
          <span
            v-if="!disableDownArrow"
            class="icon icon--arrow-down"
            @click="downButtonClicked"
          />
          <span v-else class="icon icon--arrow-down" />

          <span
            v-if="!disableUpArrow"
            class="icon icon--arrow-up"
            @click="upButtonClicked"
          />
          <span v-else class="icon icon--arrow-up" />
        </template>
      </div>
    </div>

    <div v-if="!hideBody" class="text-gray-800 p-2">
      <slot name="body" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderableCard',

  props: {
    controlsType: {
      type: String,
      required: false,
      default: 'arrows',
    },
    hideHeader: {
      type: Boolean,
      required: false,
      default: false,
    },
    hideBody: {
      type: Boolean,
      required: false,
      default: false,
    },
    disableUpArrow: {
      type: Boolean,
      required: false,
      default: false,
    },
    disableDownArrow: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {
    downButtonClicked() {
      this.$emit('orderable-card-down-button');
    },
    upButtonClicked() {
      this.$emit('orderable-card-up-button');
    },
    cogClicked() {
      this.$emit('orderable-card-cog-button');
    },
  },
};
</script>
