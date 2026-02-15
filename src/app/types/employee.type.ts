export interface allWorkLocations {
  id: number;
  name: string;
  groupNumber: number;
}

export interface allWorkLocationsResponse {
  statusCode?: number;
  message?: string;
  data: allWorkLocations[];
}

// employee type
export interface allEmployees {
  id: number;
  name: string;
  workLocationName: string;
  workSystem: string;
  accountNumber: string;
  phone: string;
  notes: string;
}

export interface EmployeesPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface EmployeesResponse {
  statusCode?: number;
  message?: string;
  data: {
    data: allEmployees[];
    pagination: EmployeesPagination;
  };
}
