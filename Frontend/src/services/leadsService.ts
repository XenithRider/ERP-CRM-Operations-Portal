import { apiClient, withMockFallback } from "./apiClient";
import { mockLeads } from "@/data/mockData";
import type { Lead, LeadStage } from "@/types";

export const leadsService = {
  list: () =>
    withMockFallback(
      () => apiClient.get<Lead[]>("/leads"),
      () => mockLeads
    ),
  getById: (id: string) =>
    withMockFallback(
      () => apiClient.get<Lead>(`/leads/${id}`),
      () => mockLeads.find((l) => l.id === id)
    ),
  updateStage: (id: string, stage: LeadStage) =>
    withMockFallback(
      () => apiClient.patch<Lead>(`/leads/${id}`, { stage }),
      () => {
        const lead = mockLeads.find((l) => l.id === id);
        if (lead) lead.stage = stage;
        return lead as Lead;
      }
    ),
  create: (payload: Partial<Lead>) =>
    withMockFallback(
      () => apiClient.post<Lead>("/leads", payload),
      () => ({ ...payload, id: `ld-${Date.now()}` } as Lead)
    ),
};
