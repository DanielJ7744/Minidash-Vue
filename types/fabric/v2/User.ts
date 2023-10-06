import type { Company } from './Company';
import type { Role } from './Role';
import type { Permission } from './Permission';

export type User = {
  id: number;
  company_id: Company['id'];
  name: string;
  email: string;
  email_verified_at?: string;
  roles?: Role['name'][];
  permissions?: Permission['name'][];
  created_at: string;
  updated_at: string;
};
