<template>
  <div>
    <ul
      class="site-header__navigation"
      @mouseleave="closeDropdown"
      @mouseover="mouseOverStatus = true"
    >
      <li class="dropdown dropdown--right-hand">
        <FormDropdownButton
          class="flex items-center"
          @click="dropdownOpen = !dropdownOpen"
        >
          <span class="icon icon--alarm text-base text-black" />
        </FormDropdownButton>
        <Transition
          appear
          enter-active-class="duration-100 ease-out"
          enter-from-class="scale-95 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-95 opacity-0"
        >
          <ul
            v-show="dropdownOpen"
            class="absolute right-0 z-20 w-56 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-sm shadow-lg"
            @mouseover="dropdownOpen = true"
          >
            <li
              v-for="(alert, index) in viewableAlerts"
              :key="index"
              class="dropdown__item hover:bg-gray-100 hover:text-gray-900 block px-4 py-2 text-sm text-gray-700 cursor-pointer"
            >
              <span
                class="dropdown__item-label dropdown__item-label--title-cased"
              >
                {{
                  alert.attributes.alert_type +
                  ' - ' +
                  alert.service.description
                }}
              </span>
            </li>
            <li
              v-if="viewableAlerts.length || readAlerts.length"
              class="dropdown__item hover:bg-gray-100 hover:text-gray-900 block px-4 py-2 text-sm text-gray-700 cursor-pointer"
            >
              <NuxtLink
                :to="{
                  path: '/client/sync-reports',
                  query: { status: 'failed', days: 1 },
                }"
              >
                <span
                  class="dropdown__item-label"
                  @click="openModal('viewAllAlerts')"
                >
                  View all alerts
                </span>
              </NuxtLink>
            </li>
            <li
              v-if="errors.length"
              class="message message--error hover:bg-gray-100 hover:text-gray-900 block px-4 py-2 text-sm text-gray-700 cursor-pointer"
            >
              <span>There were errors loading alerts: </span>
              <span v-for="(error, errorIndex) in errors" :key="errorIndex">
                {{ error.reason.message }}
              </span>
            </li>
            <li
              v-if="!errors.length && !viewableAlerts.length"
              class="hover:bg-gray-100 hover:text-gray-900 block px-4 py-2 text-sm text-gray-700 cursor-pointer"
            >
              <span
                class="dropdown__item-label dropdown__item-label--title-cased"
              >
                No alerts have been triggered
              </span>
            </li>
          </ul>
        </Transition>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'NotificationDropdown',
  data() {
    return {
      dropdownOpen: false,
      mouseOverStatus: false,
      readAlerts: [],
      errors: [],
      notifications: [],
    };
  },
  fetch() {
    // this.notifications = this.$axios.$get('/api/v2/my/notifications').then(r => r.data)
  },
  computed: {
    viewableAlerts() {
      return [];
    },
  },

  methods: {
    closeDropdown() {
      this.mouseOverStatus = false;
      setTimeout(() => {
        if (this.mouseOverStatus === false) {
          this.dropdownOpen = false;
        }
      }, 1000);
    },
  },
};
</script>
