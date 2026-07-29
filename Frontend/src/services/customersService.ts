import { apiClient } from "./apiClient";
import type {
  Customer,
  CreateCustomerPayload,
  FollowUp,
  ApiResponse,
} from "@/types";

export const customersService = {
  list: async (params?: { status?: string; search?: string; customerType?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.search) qs.set("search", params.search);
    if (params?.customerType) qs.set("customerType", params.customerType);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    const res = await apiClient.get<ApiResponse<Customer[]> & { pagination?: unknown }>(
      `/customers${query}`
    );
    return (res as ApiResponse<Customer[]> & { data: Customer[] }).data;
  },

  getById: async (id: string | number) => {
    const res = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    return res.data;
  },

  create: async (payload: CreateCustomerPayload) => {
    const res = await apiClient.post<ApiResponse<Customer>>("/customers", payload);
    return res.data;
  },

  update: async (id: string | number, payload: CreateCustomerPayload) => {
    const res = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, payload);
    return res.data;
  },

  addFollowUp: async (
    id: string | number,
    payload: { note: string; followUpDate?: string }
  ) => {
    const res = await apiClient.post<ApiResponse<FollowUp>>(
      `/customers/${id}/follow-ups`,
      payload
    );
    return res.data;
  },
};
