export type System = {
  id: number;
  system_type_id: SystemType['id'];
  name: string;
  factory_name: string;
  slug: string;
  website?: string;
  popular?: boolean;
  description?: string;
  date_format?: string;
  time_zone?: string;
  status?: string;
  documentation_link?: string;
  documentation_link_description?: string;
  environment_suffix_title?: string;
  media_url?: string;
  webhook_factory_id?: number;
  webhook_method?: number;
  has_webhooks: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};

export type SystemType = {
  id: number;
};
