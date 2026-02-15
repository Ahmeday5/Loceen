// Equipment type
export interface allSold {
  id: number;
  weight: number;
  price: number;
  soldDate: string;
  notes: string;
  traderName: number;
  accountNumber: number;
}

export interface allSoldPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  grandTotal?: number; // ← موجود في الـ response الجديد
}

export interface SoldResponse {
  statusCode?: number;
  message?: string;
  data: {
    data: allSold[];
    grandTotal?: number;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}
