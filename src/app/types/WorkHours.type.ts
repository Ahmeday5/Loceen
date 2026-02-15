// WorkHours type
export interface allWorkHours {
  id: number;
  date: string;
  hoursNumber: number;
  price: number;
  extraBonus: number;
  total: number;
  notes: string;
  equipmentOwnerName: string;
  equipmentNumber: string;
  equipmentType: string;
}

export interface allWorkHoursPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  grandTotal?: number; // ← موجود في الـ response الجديد
}

export interface WorkHoursResponse {
  statusCode?: number;
  message?: string;
  data: {
    data: allWorkHours[];
    grandTotal: number;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}
