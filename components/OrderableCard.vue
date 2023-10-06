<template>
  <section class="orderable-card">
    <header
      class="orderable-card__header"
      :class="{ 'orderable-card__header--emphasis': emphasiseHeader }"
    >
      <slot name="header" />

      <div class="orderable-card__controls">
        <template v-if="controlsType === 'cog'">
          <span class="orderable-card__control icon icon--cog" @click="cogClicked" />
        </template>
        <template v-else-if="controlsType === 'arrows'">
          <span v-if="!disableDownArrow" class="orderable-card__control icon icon--arrow-down" @click="downButtonClicked" />
          <span v-else class="orderable-card__control orderable-card__control--disabled icon icon--arrow-down" />

          <span v-if="!disableUpArrow" class="orderable-card__control icon icon--arrow-up" @click="upButtonClicked" />
          <span v-else class="orderable-card__control orderable-card__control--disabled icon icon--arrow-up" />
        </template>
      </div>
    </header>

    <div v-if="! hideBody" class="orderable-card__body">
      <slot name="body" class="orderable-card__body" />
    </div>
  </section>
</template>

<script>

export default {
  name: 'OrderableCard',

  props: {
    controlsType: {
      type: String,
      required: false,
      default: 'arrows'
    },
    emphasiseHeader: {
      type: Boolean,
      required: false,
      default: false
    },
    hideBody: {
      type: Boolean,
      required: false,
      default: false
    },
    disableUpArrow: {
      type: Boolean,
      required: false,
      default: false
    },
    disableDownArrow: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  methods: {
    downButtonClicked () {
      this.$emit('orderable-card-down-button')
    },
    upButtonClicked () {
      this.$emit('orderable-card-up-button')
    },
    cogClicked () {
      this.$emit('orderable-card-cog-button')
    }
  }
}
</script>
