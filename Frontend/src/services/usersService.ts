import { apiClient } from "./apiClient";
import type { User, ApiResponse } from "@/types";

export const usersService = {
  list: async () => {
    const res = await apiClient.get<ApiResponse<User[]>>("/users");
    return res.data;
  },
  create: async (payload: Partial<User> & { password?: string }) => {
    const res = await apiClient.post<ApiResponse<User>>("/users", payload);
    return res.data;
  },
  updateRole: async (id: string | number, role: string) => {
    const res = await apiClient.put<ApiResponse<User>>(`/users/${id}/role`, { role });
    return res.data;
  }
};
