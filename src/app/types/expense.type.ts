export interface allExpenses {
  id: number;
  date: string;
  procurementStatement: string;
  total: number;
  notes: string;
  workLocationName: string;
  groupNumber: number;
  traderName: string; // ← التغيير الرئيسي هنا
}

export interface allExpensesPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  grandTotal?: number; // ← موجود في الـ response الجديد
}

export interface ExpensesResponse {
  statusCode?: number;
  message?: string;
  data: {
    data: allExpenses[];
    grandTotal: number;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface TraderForSelection {
  id: number;
  name: string;
}

// مش محتاج TradersDropdownResponse، ممكن ترجع array مباشر
export type TradersDropdownResponse = TraderForSelection[];
