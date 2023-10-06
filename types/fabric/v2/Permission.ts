export type Permission = {
  id: number;
  name: PermissionName;
};

export const PermissionNames = [
  'create services',
  'create users',
  'manage systems',
  'json editor',
  'cron editor',
] as const;

export type PermissionName = (typeof PermissionNames)[number];
