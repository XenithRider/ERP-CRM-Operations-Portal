import { apiClient } from "./apiClient";
import type { StockMovement, CreateMovementPayload, ApiResponse } from "@/types";

export const inventoryService = {
  listMovements: async () => {
    const res = await apiClient.get<ApiResponse<StockMovement[]>>("/inventory/movements");
    return res.data;
  },

  createMovement: async (payload: CreateMovementPayload) => {
    const res = await apiClient.post<ApiResponse<StockMovement>>(
      "/inventory/movements",
      payload
    );
    return res.data;
  },
};
