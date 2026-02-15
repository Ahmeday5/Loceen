// RegisterTransfers type
export interface allRegisterTransfers {
  id: number;
  date: string;
  transfersNumber: number;
  priceForTransfer: number;
  extraBonus: number;
  total: number;
  notes: string;
  equipmentOwnerName: string;
  equipmentNumber: string;
  equipmentType: string;
}

export interface allRegisterTransfersPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  grandTotal?: number; // ← موجود في الـ response الجديد
}

export interface RegisterTransfersResponse {
  statusCode?: number;
  message?: string;
  data: {
    data: allRegisterTransfers[];
    grandTotal: number;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface EquipmentForSelection {
  id: number;
  equipmentOwnerName: string;
}

// مش محتاج TradersDropdownResponse، ممكن ترجع array مباشر
export type equipmentsDropdownResponse = EquipmentForSelection[];
