import { apiClient } from "./apiClient";
import type { User } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const authService = {
  login: async (email: string, _password: string) => {
    const res = await apiClient.post<ApiResponse<{ token: string; user: User }>>("/auth/login", {
      email,
      password: _password,
    });
    return res.data;
  },
  me: async () => {
    const res = await apiClient.get<ApiResponse<User>>("/auth/me");
    return res.data;
  },
  logout: () => {
    localStorage.removeItem("ops_portal_token");
  },
};
