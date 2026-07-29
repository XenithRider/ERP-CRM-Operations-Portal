import { apiClient, withMockFallback } from "./apiClient";
import { mockAccounts } from "@/data/mockData";
import type { Account } from "@/types";

export const accountsService = {
  list: () =>
    withMockFallback(
      () => apiClient.get<Account[]>("/accounts"),
      () => mockAccounts
    ),
  getById: (id: string) =>
    withMockFallback(
      () => apiClient.get<Account>(`/accounts/${id}`),
      () => mockAccounts.find((a) => a.id === id)
    ),
  create: (payload: Partial<Account>) =>
    withMockFallback(
      () => apiClient.post<Account>("/accounts", payload),
      () => ({ ...payload, id: `acc-${Date.now()}` } as Account)
    ),
};
