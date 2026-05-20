"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";

// Syncs the Better Auth session token to a frontend-domain cookie so
// the Next.js middleware (proxy.ts) can read it for server-side route
// protection. The session cookie set by the backend lives on the backend
// domain and is invisible to the middleware.
export function SessionSync() {
  const { data, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    // data.session.token is the bearer token issued by Better Auth
    const token = (data as { session?: { token?: string } } | null)?.session?.token;

    if (token) {
      document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`;
    } else {
      document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
    }
  }, [data, isPending]);

  return null;
}
