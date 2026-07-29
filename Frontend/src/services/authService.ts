import { apiClient, withMockFallback } from "./apiClient";
import type { User } from "@/types";

const DEMO_USER: User = {
  id: "usr-1",
  name: "Sumit Kulkarni",
  email: "sumit.kulkarni@opsportal.com",
  role: "manager",
  avatarInitials: "SK",
};

export const authService = {
  login: (email: string, _password: string) =>
    withMockFallback(
      () =>
        apiClient.post<{ token: string; user: User }>("/auth/login", {
          email,
          password: _password,
        }),
      () => ({ token: "mock-token", user: { ...DEMO_USER, email } })
    ),
  me: () =>
    withMockFallback(
      () => apiClient.get<User>("/auth/me"),
      () => DEMO_USER
    ),
  logout: () => {
    localStorage.removeItem("ops_portal_token");
  },
};
