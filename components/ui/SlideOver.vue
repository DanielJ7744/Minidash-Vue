<template>
  <Transition leave-active-class="duration-300" appear>
    <div
      v-show="open"
      class="fixed z-40 flex"
      :class="{
        'md:hidden': mobileOnly,
        'inset-0': !fromRight,
        'inset-y-0 right-0': fromRight,
      }"
      role="dialog"
      aria-modal="true"
    >
      <div
        v-if="fromRight"
        class="flex-shrink-0 w-14"
        aria-hidden="true"
      />

      <Transition
        appear
        enter-active-class="transition-opacity duration-300 ease-linear"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-300 ease-linear"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-show="open"
          class="fixed inset-0 bg-gray-600 bg-opacity-75"
          aria-hidden="true"
          @click="close"
        />
      </Transition>
      <Transition
        appear
        enter-active-class="transition duration-300 ease-in-out transform"
        :enter-from-class="
          !fromRight ? '-translate-x-full' : 'translate-x-full'
        "
        enter-to-class="translate-x-0"
        leave-active-class="transition duration-300 ease-in-out transform"
        leave-from-class="translate-x-0"
        :leave-to-class="
          !fromRight ? '-translate-x-full' : 'translate-x-full'
        "
      >
        <div
          v-show="open"
          class="relative flex flex-col flex-1 w-full bg-white focus:outline-none"
          :class="[wide ? 'max-w-md' : 'max-w-xs']"
        >
          <Transition
            appear
            enter-active-class="duration-300 ease-in-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="duration-300 ease-in-out"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div
              v-show="open"
              class="absolute top-0 pt-2"
              :class="{
                '-mr-12': !fromRight,
                'right-0': !fromRight,
                '-ml-12': fromRight,
              }"
            >
              <button
                type="button"
                class="flex items-center justify-center w-10 h-10 ml-1 rounded focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                @click="close"
              >
                <span class="sr-only">Close sidebar</span>
                <!-- Heroicon name: outline/x -->
                <svg
                  class="w-6 h-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </Transition>

          <slot />
        </div>
      </Transition>

      <div
        v-if="!fromRight"
        class="flex-shrink-0 w-14"
        aria-hidden="true"
      />
      <!-- Force sidebar to shrink to fit close icon -->
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'SlideOver',
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    mobileOnly: {
      type: Boolean,
      required: false,
      default: true,
    },
    wide: {
      type: Boolean,
      required: false,
      default: false,
    },
    fromRight: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  watch: {
    $route: 'close',
  },
  methods: {
    close() {
      this.$emit('close');
    },
  },
};
</script>
