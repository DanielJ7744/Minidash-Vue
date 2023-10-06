const { $can, $role } = useNuxtApp();

declare module '#app' {
  interface PageMeta {
    can?: Parameters<typeof $can>[0];
    role?: Parameters<typeof $role>[0];
    wide?: boolean;
  }
}

export {};
