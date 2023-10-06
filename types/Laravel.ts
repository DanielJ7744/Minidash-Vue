export interface PaginatedResponse<T> {
  data: T[];
  readonly links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
  readonly meta: {
    current_page: number;
    from?: number;
    last_page: number;
    path: string;
    per_page: number;
    to?: number;
    total: number;
    links: [
      {
        url?: string;
        label: string;
        active: boolean;
      }
    ];
  };
}
