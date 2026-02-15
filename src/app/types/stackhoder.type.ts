export interface allStakeholder {
  id: number;
  name: string;
  address: string;
  phone: string;
  accountNumber: string;
  activityType: string;
}

export interface StakeholdersPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext?: boolean;      // اختياري لو موجود
  hasPrevious?: boolean;  // اختياري
}

export interface StakeholdersResponse {
  statusCode?: number;
  message?: string;
  data: {
    data: allStakeholder[];
    pagination: StakeholdersPagination;
  };
}
