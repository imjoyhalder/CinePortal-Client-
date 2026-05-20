import { getSession } from "./auth-client";

/**
 * Returns the correct API base depending on execution context.
 * - Server (SSR / RSC): calls the backend directly (no round-trip through Next.js)
 * - Client (browser): routes through the /api/proxy handler to avoid CORS and
 *   let Next.js middleware / edge functions handle cookie forwarding.
 */
function getApiBase(): string {
  if (typeof window === "undefined") {
    const backend =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000";
    return `${backend}/api`;
  }
  return "/api/proxy";
}

/**
 * Get the bearer token for the current session.
 * 1. Reads from the auth_token cookie if already set (fast path — no network).
 * 2. Falls back to getSession() to handle the race where the page loads before
 *    SessionSync has had a chance to write the cookie.
 */
async function getBearerToken(): Promise<string | undefined> {
  // Fast path: cookie already set by SessionSync
  const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
  if (match?.[1]) return match[1];

  // Slow path: ask Better Auth directly (happens on first load / OAuth redirect)
  try {
    const { data } = await getSession();
    const token = (data as { session?: { token?: string } } | null)?.session?.token;
    if (token) {
      // Warm the cookie so subsequent calls hit the fast path
      document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`;
    }
    return token ?? undefined;
  } catch {
    return undefined;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getApiBase()}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Include Bearer token on client-side requests so the proxy can forward it
  if (typeof window !== "undefined") {
    const token = await getBearerToken();
    if (token) headers["authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || `Request failed: ${res.status}`);
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string, init?: RequestInit) =>
    apiRequest<T>(endpoint, { method: "GET", ...init }),
  post: <T>(endpoint: string, body?: unknown, init?: RequestInit) =>
    apiRequest<T>(endpoint, { method: "POST", body: JSON.stringify(body), ...init }),
  patch: <T>(endpoint: string, body?: unknown, init?: RequestInit) =>
    apiRequest<T>(endpoint, { method: "PATCH", body: JSON.stringify(body), ...init }),
  put: <T>(endpoint: string, body?: unknown, init?: RequestInit) =>
    apiRequest<T>(endpoint, { method: "PUT", body: JSON.stringify(body), ...init }),
  delete: <T>(endpoint: string, init?: RequestInit) =>
    apiRequest<T>(endpoint, { method: "DELETE", ...init }),
};
