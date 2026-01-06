export interface ResponseDto<T = any> {
  statusCode?: number;
  message?: string;
  data?: T;
  processId?: string;
  duration?: string;
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
