import { apiClient } from "./apiClient";
import type { Challan, CreateChallanPayload, ApiResponse } from "@/types";
import { API_BASE_URL } from "./apiClient";

function getToken(): string | null {
  return localStorage.getItem("ops_portal_token");
}

export const challansService = {
  list: async (params?: { status?: string; customerId?: string | number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.customerId) qs.set("customerId", String(params.customerId));
    const query = qs.toString() ? `?${qs.toString()}` : "";
    const res = await apiClient.get<ApiResponse<Challan[]>>(`/challans${query}`);
    return res.data;
  },

  getById: async (id: string | number) => {
    const res = await apiClient.get<ApiResponse<Challan>>(`/challans/${id}`);
    return res.data;
  },

  create: async (payload: CreateChallanPayload) => {
    const res = await apiClient.post<ApiResponse<Challan>>("/challans", payload);
    return res.data;
  },

  update: async (id: string | number, payload: CreateChallanPayload) => {
    const res = await apiClient.put<ApiResponse<Challan>>(`/challans/${id}`, payload);
    return res.data;
  },

  confirm: async (id: string | number) => {
    const res = await apiClient.post<ApiResponse<Challan>>(`/challans/${id}/confirm`, {});
    return res.data;
  },

  cancel: async (id: string | number) => {
    const res = await apiClient.post<ApiResponse<Challan>>(`/challans/${id}/cancel`, {});
    return res.data;
  },

  downloadInvoice: async (id: string | number, challanNumber: string) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/challans/${id}/invoice`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(text || `Request failed: ${response.status}`);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${challanNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
