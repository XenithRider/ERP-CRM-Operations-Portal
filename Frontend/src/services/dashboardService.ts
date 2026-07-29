import { apiClient, withMockFallback } from "./apiClient";
import { mockDashboard } from "@/data/mockData";
import type { DashboardMetrics } from "@/types";

export const dashboardService = {
  getMetrics: () =>
    withMockFallback(
      () => apiClient.get<DashboardMetrics>("/dashboard/metrics"),
      () => mockDashboard
    ),
};
