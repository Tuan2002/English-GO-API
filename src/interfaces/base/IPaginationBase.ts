export interface IPaginationBase {
  page: number;
  limit: number;
  search?: {
    [key: string]: string | number;
  };
}

export interface IPaginationResponse {
  items: any[];
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
