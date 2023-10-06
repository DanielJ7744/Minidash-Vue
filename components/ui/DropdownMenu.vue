<template>
  <div
    v-on-click-outside="close"
    class="relative inline-block text-left"
  >
    <slot
      :open="open"
      :buttonProps="{ 'aria-expanded': open, 'aria-haspopup': true }"
      :buttonEvents="{ click: toggle }"
    >
      <ButtonBase
        class="button button-dropdown"
        v-bind="{ 'aria-expanded': open, 'aria-haspopup': true }"
        :open="open"
        v-on="{ click: toggle }"
      >
        <!-- Heroicon name: solid/dots-horizontal -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"
          />
        </svg>
      </ButtonBase>
    </slot>

    <Transition
      appear
      enter-active-class="duration-100 ease-out"
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
    >
      <div
        v-show="open"
        class="absolute z-20 w-56 mt-2 bg-white divide-y divide-gray-100 rounded-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        :class="[
          originLeft
            ? 'left-0 origin-top-left'
            : 'right-0 origin-top-right',
        ]"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="menu-button"
        tabindex="-1"
      >
        <div
          v-for="({ title, action, link, classes }, i) in linksToDisplay"
          :key="i"
          :class="[links.length > 1 ? 'py-1' : '', classes]"
          role="none"
        >
          <a
            class="block px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 hover:text-gray-900"
            :class="classes"
            role="menuitem"
            tabindex="-1"
            @click="handleClick({ action, link })"
          >
            {{ title }}
          </a>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { v4 as uuid } from 'uuid';

export default {
  name: 'DropdownMenu',
  props: {
    id: {
      type: String,
      required: false,
      default: () => uuid(),
    },
    links: {
      type: Array,
      required: true,
    },
    originLeft: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const open = shallowRef(false);
    const bus = useEventBus('dropdown:opened');

    bus.on(id => props.id !== id && (open.value = false));

    whenever(open, () => bus.emit(props.id));

    return {
      open,
    };
  },
  computed: {
    linksToDisplay() {
      return this.links
        .map(link => ({ to: null, if: true, ...link }))
        .filter(link => link.if);
    },
  },
  methods: {
    toggle() {
      this.open = !this.open;
    },
    async handleClick({ action, link }) {
      this.close();

      if (action) {
        await action();
      }

      if (link) {
        navigateTo(link);
      }
    },
    close() {
      if (this.open) {
        this.open = false;
      }
    },
  },
};
</script>
