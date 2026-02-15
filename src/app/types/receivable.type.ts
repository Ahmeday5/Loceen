// Equipment type
export interface allReceivables {
  id: number;
  date: string;
  procurementStatement: string;
  total: number;
  notes: string;
  workLocationName: string;
  groupNumber: number;
  traderName: string; // ← التغيير الرئيسي هنا
}

export interface allReceivablesPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext?: boolean; // اختياري لو موجود
  hasPrevious?: boolean; // اختياري
}

export interface ReceivablesResponse {
  statusCode?: number;
  message?: string;
  data: {
    data: allReceivables[];
    grandTotal: number;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}
