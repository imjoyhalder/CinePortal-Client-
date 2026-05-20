"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Better Auth additional fields aren't reflected in the generated types
  type UserWithRole = NonNullable<typeof session>["user"] & { role?: string };
  const user = session?.user as UserWithRole | undefined;

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.replace("/sign-in");
      return;
    }

    if (requireAdmin && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, isPending, requireAdmin, router]);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;
  if (requireAdmin && user.role !== "ADMIN") return null;

  return <>{children}</>;
}
