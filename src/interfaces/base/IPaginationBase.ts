export interface IPaginationBase {
  page: number;
  limit: number;
  search?: {
    [key: string]: string | number | undefined | boolean;
  };
}

export interface IPaginationResponse {
  items: any[];
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
