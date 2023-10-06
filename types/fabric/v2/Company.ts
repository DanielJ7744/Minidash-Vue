import { Subscription } from './Subscription';

export type Company = {
  id: number;
  name: string;
  company_website?: string;
  company_phone?: string;
  company_email?: string;
  active: boolean;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  settings?: CompanySettings;
  subscriptions?: Subscription[];
};

export type CompanySettings = {
  id: number;
  company_id: Company['id'];
  bi_redemption_url?: string;
};
