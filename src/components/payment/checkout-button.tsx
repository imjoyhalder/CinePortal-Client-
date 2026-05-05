"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiLoader } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface CheckoutButtonProps {
  plan: "MONTHLY" | "YEARLY";
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export default function CheckoutButton({
  plan,
  className,
  children,
  variant = "default",
  size = "default",
}: CheckoutButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if ((session?.user as { role?: string } | undefined)?.role === "ADMIN") return null;

  async function handleCheckout() {
    if (!session?.user) {
      router.push("/sign-in");
      return;
    }

    setLoading(true);
    try {
      const resp = await api.post<{ success: boolean; data: { sessionId: string; url: string } }>(
        "/payments/checkout",
        { plan }
      );
      if (resp.data?.url) {
        window.location.href = resp.data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start checkout");
      setLoading(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <FiLoader className="w-4 h-4 animate-spin" />
          Redirecting…
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
