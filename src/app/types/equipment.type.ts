// Equipment type
export interface allEquipment {
  id: number;
  equipmentNumber: string;
  equipmentType: string;
  workSystem: string;
  equipmentOwnerName: string;
  equipmentOwnerPhone: string;
}

export interface allEquipmentsPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext?: boolean; // اختياري لو موجود
  hasPrevious?: boolean; // اختياري
}

export interface EquipmentsResponse {
  statusCode?: number;
  message?: string;
  data: {
    data: allEquipment[];
    pagination: allEquipmentsPagination;
  };
}
