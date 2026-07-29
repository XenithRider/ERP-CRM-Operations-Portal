import { apiClient } from "./apiClient";
import type { Product, CreateProductPayload, ApiResponse } from "@/types";

export const productsService = {
  list: async (params?: { search?: string; category?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.category) qs.set("category", params.category);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    const res = await apiClient.get<ApiResponse<Product[]>>(`/products${query}`);
    return res.data;
  },

  getById: async (id: string | number) => {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data;
  },

  create: async (payload: CreateProductPayload) => {
    const res = await apiClient.post<ApiResponse<Product>>("/products", payload);
    return res.data;
  },

  update: async (id: string | number, payload: Partial<CreateProductPayload>) => {
    const res = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, payload);
    return res.data;
  },

  uploadImage: async (id: string | number, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await apiClient.post<ApiResponse<Product>>(`/products/${id}/image`, formData);
    return res.data;
  },
};
