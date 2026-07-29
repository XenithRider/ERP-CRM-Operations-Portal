import { apiClient, withMockFallback } from "./apiClient";
import { mockInventory } from "@/data/mockData";
import type { InventoryItem } from "@/types";

export const inventoryService = {
  list: () =>
    withMockFallback(
      () => apiClient.get<InventoryItem[]>("/inventory"),
      () => mockInventory
    ),
};
