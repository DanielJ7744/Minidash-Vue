<template>
  <div class="relative h-full">
    <div class="absolute inset-0 h-screen overflow-hidden">
      <img
        class="sm:scale-100 object-cover w-full h-full"
        src="/images/zigzag-bg.svg"
        alt="Background"
      />
    </div>

    <div class="relative flex flex-col min-h-full">
      <header class="flex items-center h-16 px-3">
        <a href="https://www.wearepatchworks.com/">
          <img src="/images/pw-logo.svg" alt="Patchworks" />
        </a>
      </header>

      <main class="flex flex-col items-center justify-center flex-1">
        <slot />

        <footer class="w-full h-12 p-3 mt-auto">
          <ul class="flex items-center">
            <li
              v-for="(link, idx) in footerLinks"
              :key="idx"
              class="bg-white/30 hover:bg-white/75 px-2 py-1 duration-100 transform rounded"
            >
              <p class="text-xs">
                <NuxtLink v-bind="link.props">
                  {{ link.text }}
                </NuxtLink>
              </p>
            </li>
          </ul>
        </footer>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: "GuestLayout",
  data: () => ({
    footerLinks: [
      {
        text: "Privacy policy",
        props: {
          to: "https://www.wearepatchworks.com/pages/privacy-policy",
          target: "_blank",
        },
      },
      {
        text: "Service agreement",
        props: {
          to: "https://www.wearepatchworks.com/pages/ipaas-service-agreement",
          target: "_blank",
        },
      },
    ],
  }),
};
</script>
