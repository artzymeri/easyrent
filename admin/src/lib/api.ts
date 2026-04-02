const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4344/api";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T = unknown>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((customHeaders as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (typeof window !== "undefined") {
    const stored = localStorage.getItem("admin_token");
    if (stored) headers["Authorization"] = `Bearer ${stored}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    ...rest,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T = unknown>(endpoint: string, opts?: FetchOptions) =>
    apiFetch<T>(endpoint, { method: "GET", ...opts }),

  post: <T = unknown>(endpoint: string, data: unknown, opts?: FetchOptions) =>
    apiFetch<T>(endpoint, { method: "POST", body: JSON.stringify(data), ...opts }),

  put: <T = unknown>(endpoint: string, data: unknown, opts?: FetchOptions) =>
    apiFetch<T>(endpoint, { method: "PUT", body: JSON.stringify(data), ...opts }),

  delete: <T = unknown>(endpoint: string, opts?: FetchOptions) =>
    apiFetch<T>(endpoint, { method: "DELETE", ...opts }),
};
