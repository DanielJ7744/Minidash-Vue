<template>
  <div
    :class="{ hidden: hideDevelopmentSystem }"
    @click="installSystem()"
    @click.prevent="!isClickableSystem"
  >
    <div
      :class="{
        'opacity-25': !isClickableSystem,
        'cursor-default': !isClickableSystem,
        'cursor-pointer': isClickableSystem,
        'bg-green-100': isDevelopmentSystem,
      }"
    >
      <UiMediaBlock
        class="p-1"
        :title="system.name"
        :image="appCardImage"
        :small-text="true"
        :background-image="'/images/systems/default.png'"
      >
        {{ description }}
        <p v-if="!isClickableSystem" class="app-card__text">Coming soon</p>
      </UiMediaBlock>
    </div>
  </div>
</template>

<script>
import { systemsHelperMixin } from '~/mixins/system-helper-mixin';

export default {
  name: 'AppCard',
  mixins: [systemsHelperMixin],
  props: {
    description: {
      type: String,
      default: '',
    },
    system: {
      type: Object,
      required: true,
    },
    hasMatchingCredentials: {
      type: Boolean,
      required: true,
    },
    preventClick: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      user: null,
    };
  },
  computed: {
    appCardImage() {
      return getSystemLogo(this.system.name);
    },
    isClickableSystem() {
      return (
        this.hasMatchingCredentials && this.isActiveSystem && !this.preventClick
      );
    },
    isActiveSystem() {
      return (
        this.system.status === 'active' || this.system.status === 'development'
      );
    },
    hideDevelopmentSystem() {
      return !this.$patchworksAdmin() && this.system.status === 'development';
    },
    isDevelopmentSystem() {
      return this.$patchworksAdmin() && this.system.status === 'development';
    },
  },
  methods: {
    installSystem() {
      if (!this.hasMatchingCredentials || !this.isClickableSystem) {
        return;
      }
      this.$emit('install-system', this.system);
    },
  },
};
</script>
