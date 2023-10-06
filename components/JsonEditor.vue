<template>
  <div>
    <div v-if="displayBackLink" class="mb-3">
      <button @click.prevent="goBack" class="button-icon space-x-2">
        <span class="icon clickable-icon icon--arrow-left" />
        <span class="icon clickable-text">{{ backText }}</span>
      </button>
    </div>
    <MonacoEditor
      v-model="data"
      lang="json"
      class="w-full h-[1000px]"
      :options="{ minimap: { enabled: showMinimap }, automaticLayout: true, tabSize: 2, wordWrap: 'on' }"
      ref="monacoEditor"
    />
    <button
      v-if="!hideButton"
      class="button button-primary button-lg"
      :disabled="invalid"
      @click="update"
    >
      {{ invalid ? 'Invalid JSON' : buttonText }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'JsonEditor',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    backText: {
      type: String,
      required: false,
      default: null,
    },
    buttonText: {
      type: String,
      required: false,
      default: 'Update',
    },
    displayBackLink: {
      type: Boolean,
      required: false,
      default: false,
    },
    hideButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    usePositionClasses: {
      type: Boolean,
      required: false,
      default: true,
    },
    showMinimap: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      invalid: false,
    };
  },
  computed: {
    data: {
      get() {
        return JSON.stringify(this.modelValue, null, '\t');
      },
      set(value) {
        this.validateJson();

        if (!this.invalid) {
          this.$emit('update:modelValue', JSON.parse(value));
        }
      },
    },
  },
  methods: {
    validateJson() {
      try {
        JSON.parse(this.data);
        this.invalid = false;
      } catch (error) {
        this.invalid = true;
      }
    },
    goBack() {
      this.$emit('go-back');
    },
    update() {
      this.$emit('update');
    },
  },
};
</script>
