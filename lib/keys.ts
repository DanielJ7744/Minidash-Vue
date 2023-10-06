export const flowStepSidebarKey = Symbol() as InjectionKey<{
  renderSidebar: Ref<boolean>;
  updateRenderSidebar: (b: boolean) => void;
}>;

export const flowStepSocketLineBus = 'flowStepSocketLineBus';
