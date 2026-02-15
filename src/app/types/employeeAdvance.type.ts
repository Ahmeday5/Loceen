// workingperiods type
export interface allworkingperiods {
  id: number;
  startDate: string;
  endDate: string;
  extraWork: number;
  workSystem: string;
  salary: number;
  totalDue: number;
  employeeName: string;
  workLocationName: string;
}

export interface allworkingperiodsPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  grandTotal?: number; // ← موجود في الـ response الجديد
}

export interface workingperiodsResponse {
  statusCode?: number;
  message?: string;
  data: {
    data: allworkingperiods[];
    grandTotal: number;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface employeesForSelection {
  id: number;
  name: string;
}

// مش محتاج TradersDropdownResponse، ممكن ترجع array مباشر
export type employeesDropdownResponse = employeesForSelection[];
