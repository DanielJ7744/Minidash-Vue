import { defineStore } from 'pinia';

/**
 * 🧨 Scheduled for destruction.
 */
export const useUiStore = defineStore('ui', {
  state: (): {
    openModalId: string | undefined;
  } => {
    return {
      openModalId: undefined,
    };
  },
  actions: {
    openModal(modalId: string): void {
      this.openModalId = modalId;
    },
    closeModal(): void {
      this.openModalId = undefined;
    },
  },
});
