import { Directive, DirectiveBinding } from 'vue';
import Tooltip from 'primevue/tooltip';

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp
    .directive('tooltip', Tooltip)
    .directive('on-click-outside', OnClickOutside);
});

const OnClickOutside: Directive = {
  mounted: (element: HTMLElement, binding: DirectiveBinding) => {
    // @ts-ignore
    element.clickOutside = function (event: ClickEvent): void {
      if (!(element === event.target || element.contains(event.target))) {
        binding.value(event, element);
      }
    };

    // @ts-ignore
    document.body.addEventListener('click', element.clickOutside, {
      passive: true,
    });
  },
  beforeUnmount: (element: HTMLElement) => {
    // @ts-ignore
    document.body.removeEventListener('click', element.clickOutside);
  },
};
