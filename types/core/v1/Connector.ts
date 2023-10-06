export type Connector = {
  id: number;
  authentication_implementation_id: AuthenticationImplementation['id'];
  name: string;
  base_url: string;
};
