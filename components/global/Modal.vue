<template>
  <ClientOnly>
    <Teleport to="#modal-portal">
      <Transition leave-active-class="duration-200" appear>
        <div
          v-show="isOpen"
          @keydown.esc="closeModal"
          class="relative z-10"
          role="dialog"
          aria-modal="true"
          tabindex="0"
        >
          <Transition
            appear
            enter-active-class="ease-out duration-300"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="ease-in duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div
              v-if="isOpen"
              class="fixed inset-0 bg-gray-400 bg-opacity-60 transition-opacity"
            ></div>
          </Transition>

          <div class="fixed inset-0 z-10 overflow-y-auto">
            <div
              ref="backdrop"
              @click="closeModalFromBackdrop"
              class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
            >
              <Transition
                appear
                enter-active-class="ease-out duration-300"
                enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enter-to-class="opacity-100 translate-y-0 sm:scale-100"
                leave-active-class="ease-in duration-200"
                leave-from-class="opacity-100 translate-y-0 sm:scale-100"
                leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div
                  ref="content"
                  v-if="isOpen"
                  class="relative transform overflow-hidden rounded-sm bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:p-6"
                  :class="{
                    'sm:max-w-lg': size === 'sm',
                    'sm:max-w-2xl': size === 'md',
                    'sm:max-w-5xl': size === 'lg',
                  }"
                >
                  <div
                    class="absolute top-0 right-0 hidden pt-4 pr-4 sm:block"
                  >
                    <button
                      type="button"
                      @click="closeModal"
                      class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
                    >
                      <span class="sr-only">Close</span>
                      <!-- Heroicon name: outline/x-mark -->
                      <svg
                        class="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <slot />
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<script>
import { mapState, mapActions } from 'pinia';

/**
 * 🧨 Scheduled for destruction.
 */
export default {
  name: 'Modal',
  inheritAttrs: false,
  props: {
    title: {
      type: String,
      required: false,
      default: null,
    },
    id: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: false,
      default: 'sm',
    },
    closeOnBackdropClick: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data: () => ({
    isOpen: false,
  }),
  computed: {
    ...mapState(useUiStore, ['openModalId']),
    isCurrentModal() {
      return this.openModalId === this.id;
    },
  },
  watch: {
    isCurrentModal: {
      immediate: true,
      handler(value, oldValue) {
        if (value === true) {
          this.isOpen = true;

          this.focus();

          return;
        }

        if (oldValue === true) {
          this.$emit('modal-closed', {
            modalId: this.id,
          });

          this.isOpen = false;
        }
      },
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal']),
    focus() {
      this.$nextTick(() => {
        const input = this.$refs.content.querySelector('input');

        if (input) {
          input.focus();

          return;
        }

        this.$refs.content.querySelector('button')?.focus();
      });
    },
    closeModalFromBackdrop(e) {
      if (this.closeOnBackdropClick && e.target === this.$refs.backdrop) {
        this.closeModal();
      }
    },
  },
};
</script>
