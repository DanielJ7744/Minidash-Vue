import type { Permission } from './Permission';

export type Role = {
  id: number;
  name: RoleName;
  permissions?: Permission[];
};

export const RoleNames = [
  'client user',
  'client admin',
  'patchworks user',
  'patchworks admin',
  'advanced editor',
  'systems manager',
  'developer',
] as const;

export type RoleName = (typeof RoleNames)[number];
