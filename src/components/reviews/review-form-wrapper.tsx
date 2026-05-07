"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import ReviewForm from "./review-form";
import Link from "next/link";
import { FiLock } from "react-icons/fi";
import { api } from "@/lib/api";
import type { ApiResponse, Subscription, Pricing } from "@/types";

interface ReviewFormWrapperProps {
  mediaId: string;
  pricing?: Pricing;
}

export default function ReviewFormWrapper({ mediaId, pricing }: ReviewFormWrapperProps) {
  const { data: session, isPending } = useSession();
  const [show, setShow] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null | undefined>(undefined);

  // Fetch subscription once the user is known to be logged in
  useEffect(() => {
    if (!session) { setSubscription(null); return; }
    api.get<ApiResponse<Subscription | null>>("/payments/subscription")
      .then((r) => setSubscription(r.data ?? null))
      .catch(() => setSubscription(null));
  }, [session]);

  if (isPending || subscription === undefined) return null;

  if (!session) {
    return (
      <div className="bg-card rounded-xl border border-border/50 p-6 text-center">
        <p className="text-muted-foreground mb-3">Sign in to write a review</p>
        <Button asChild><Link href="/sign-in">Sign In</Link></Button>
      </div>
    );
  }

  const isAdmin = session.user.role === "ADMIN";
  const hasPaidPlan =
    isAdmin ||
    (subscription?.status === "ACTIVE" && subscription.plan !== "FREE");

  // Block free users from reviewing premium content
  if (pricing === "premium" && !hasPaidPlan) {
    return (
      <div className="bg-card rounded-xl border border-amber-500/30 p-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto">
          <FiLock className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className="font-semibold text-sm">Premium subscription required</p>
          <p className="text-xs text-muted-foreground mt-1">
            Only Pro and Annual subscribers can review premium content.
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/dashboard/subscription">Upgrade Plan</Link>
        </Button>
      </div>
    );
  }

  if (!show) {
    return (
      <Button onClick={() => setShow(true)} variant="outline" className="w-full sm:w-auto">
        Write a Review
      </Button>
    );
  }

  return (
    <ReviewForm
      mediaId={mediaId}
      onSuccess={() => setShow(false)}
      onCancel={() => setShow(false)}
    />
  );
}
