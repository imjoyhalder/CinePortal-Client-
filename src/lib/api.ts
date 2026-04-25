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

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getApiBase()}${endpoint}`;

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "include",
    ...options,
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
  delete: <T>(endpoint: string, init?: RequestInit) =>
    apiRequest<T>(endpoint, { method: "DELETE", ...init }),
};
