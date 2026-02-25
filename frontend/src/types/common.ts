export type Currency = 'USD' | 'FC';

export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'overdue' | 'closed' | 'frozen';

export interface RunningTotal {
  amount: number;
  currency: Currency;
  changePct: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
