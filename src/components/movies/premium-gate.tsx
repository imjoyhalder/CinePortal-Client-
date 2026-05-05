"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiPlay, FiLock, FiArrowRight } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import type { ApiResponse, Subscription } from "@/types";

interface PremiumGateProps {
  streamingUrl: string;
  mediaTitle: string;
  pricing: "free" | "premium";
}

export default function PremiumGate({ streamingUrl, mediaTitle, pricing }: PremiumGateProps) {
  const { data: session } = useSession();
  const [sub,     setSub]     = useState<Subscription | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session || pricing === "free") return;
    setLoading(true);
    api.get<ApiResponse<Subscription | null>>("/payments/subscription")
      .then((r) => setSub(r.data ?? null))
      .catch(() => setSub(null))
      .finally(() => setLoading(false));
  }, [session, pricing]);

  const hasPremium =
    sub?.adminAccess === true ||
    (sub?.status === "ACTIVE" && sub.plan !== "FREE");

  // Free content — always show Watch Now
  if (pricing === "free") {
    return (
      <Button size="lg" className="w-full md:w-fit px-10 py-6 text-base font-bold rounded-full" asChild>
        <a href={streamingUrl} target="_blank" rel="noopener noreferrer">
          <FiPlay className="mr-2 fill-current" /> Watch Now
        </a>
      </Button>
    );
  }

  // Still loading subscription status
  if (loading || sub === undefined) {
    return (
      <Button size="lg" className="w-full md:w-fit px-10 py-6 text-base font-bold rounded-full opacity-70" disabled>
        <FiPlay className="mr-2" /> Watch Now
      </Button>
    );
  }

  // Has premium access
  if (hasPremium) {
    return (
      <Button size="lg" className="w-full md:w-fit px-10 py-6 text-base font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" asChild>
        <a href={streamingUrl} target="_blank" rel="noopener noreferrer">
          <FiPlay className="mr-2 fill-current" /> Watch Now
        </a>
      </Button>
    );
  }

  // No subscription — show upgrade prompt
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3 max-w-sm">
      <div className="flex items-center gap-2">
        <FiLock className="w-4 h-4 text-primary shrink-0" />
        <p className="font-semibold text-sm">Premium Content</p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        <span className="font-medium text-foreground">&ldquo;{mediaTitle}&rdquo;</span> requires an active
        subscription to watch. Upgrade to unlock all premium content.
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        {!session ? (
          <Button size="sm" asChild className="gap-1.5">
            <Link href="/sign-in"><FiArrowRight className="w-3.5 h-3.5" /> Sign in to watch</Link>
          </Button>
        ) : (
          <Button size="sm" asChild className="gap-1.5">
            <Link href="/dashboard/subscription">
              <MdVerified className="w-3.5 h-3.5" /> Upgrade to Premium
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
