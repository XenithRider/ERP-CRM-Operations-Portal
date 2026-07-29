import { apiClient, withMockFallback } from "./apiClient";
import { mockInvoices } from "@/data/mockData";
import type { Invoice } from "@/types";

export const invoicesService = {
  list: () =>
    withMockFallback(
      () => apiClient.get<Invoice[]>("/invoices"),
      () => mockInvoices
    ),
};
