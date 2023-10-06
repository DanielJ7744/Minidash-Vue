export type Subscription = {
  id: number;
  name: string;
  upgrade: boolean;
  business_insights: boolean;
  product_type: string;
};

export type SubscriptionUsage = {
  transaction_count: number;
  total_pull_data_size: number;
  active_users: number;
  active_services: number;
  inbound_apis: number;
};

export type SubscriptionAllowance = {
  users: number;
  price: number;
  services: number;
  api_keys: number;
  transactions: number;
  sftp: false;
  business_insights: false;
  tiers: string[];
};

export type SubscriptionResponse = {
  data: Subscription[];
  summary: {
    usage: SubscriptionUsage;
    allowance: SubscriptionAllowance;
  };
};
