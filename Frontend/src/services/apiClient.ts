// ---- Central HTTP client for the Operations Portal ----
//
// The backend base URL and auth are configured here. Point
// VITE_API_BASE_URL (see .env.example) at the ERP-CRM backend's REST
// gateway once it's available. Until then, USE_MOCK falls back to the
// bundled mock data in src/data/mockData.ts so every page in the app
// is fully functional out of the box.

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "/api";

export const USE_MOCK: boolean =
  (import.meta.env.VITE_USE_MOCK ?? "true") === "true";

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  return localStorage.getItem("ops_portal_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { ApiError };

// Small helper: try a real API call, but transparently fall back to a
// mock resolver when USE_MOCK is on or the call fails (e.g. backend
// not running yet). This keeps every page working during frontend
// development and demoing, while the wiring for the real endpoint is
// already in place in each service file below.
export async function withMockFallback<T>(
  live: () => Promise<T>,
  mock: () => T | Promise<T>
): Promise<T> {
  if (USE_MOCK) return mock();
  try {
    return await live();
  } catch {
    return mock();
  }
}
