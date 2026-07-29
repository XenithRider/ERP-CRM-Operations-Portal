import { apiClient, withMockFallback } from "./apiClient";
import { mockOrders } from "@/data/mockData";
import type { Order } from "@/types";

export const ordersService = {
  list: () =>
    withMockFallback(
      () => apiClient.get<Order[]>("/orders"),
      () => mockOrders
    ),
  getById: (id: string) =>
    withMockFallback(
      () => apiClient.get<Order>(`/orders/${id}`),
      () => mockOrders.find((o) => o.id === id)
    ),
};
