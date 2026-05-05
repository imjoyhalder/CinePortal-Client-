"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FiCheckCircle, FiArrowRight, FiCalendar, FiClock, FiRefreshCw,
} from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { ApiResponse, Subscription } from "@/types";

const PLAN_FEATURES: Record<"MONTHLY" | "YEARLY", string[]> = {
  MONTHLY: [
    "Unlimited reviews & comments",
    "Access to all premium content",
    "Ad-free experience",
    "Advanced search & filters",
    "Email notifications",
  ],
  YEARLY: [
    "Everything in Monthly",
    "2 months free — save 33%",
    "Priority support",
    "Early access to new titles",
    "Download for offline viewing",
  ],
};

type PageStatus = "loading" | "active" | "pending";

export default function SubscriptionSuccessClient() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");
  const attemptRef = useRef(0);
  const MAX_ATTEMPTS = 8;

  useEffect(() => {
    // Parse session_id from URL without useSearchParams (avoids Suspense requirement)
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) { setStatus("pending"); return; }

    let cancelled = false;

    async function checkActivation() {
      try {
        // First attempt: call sync endpoint which queries Stripe directly —
        // this works locally without the Stripe CLI webhook listener.
        if (attemptRef.current === 0) {
          try {
            const syncRes = await api.post<ApiResponse<Subscription>>(
              `/payments/subscription/sync?session_id=${sessionId}`
            );
            if (!cancelled && syncRes.data && syncRes.data.status === "ACTIVE" && syncRes.data.plan !== "FREE") {
              setSubscription(syncRes.data);
              setStatus("active");
              return;
            }
          } catch { /* sync failed, fall through to polling */ }
        }

        const res = await api.get<ApiResponse<Subscription>>("/payments/subscription");
        const sub = res.data;

        if (!cancelled && sub && sub.status === "ACTIVE" && sub.plan !== "FREE") {
          setSubscription(sub);
          setStatus("active");
          return;
        }

        attemptRef.current += 1;
        if (!cancelled && attemptRef.current < MAX_ATTEMPTS) {
          setTimeout(checkActivation, 2000);
        } else if (!cancelled) {
          setStatus("pending");
        }
      } catch {
        if (!cancelled) setStatus("pending");
      }
    }

    checkActivation();
    return () => { cancelled = true; };
  }, []);

  const planKey = subscription?.plan === "YEARLY" ? "YEARLY" : "MONTHLY";
  const planLabel = planKey === "YEARLY" ? "Annual" : "Monthly";
  const planPrice = planKey === "YEARLY" ? "$79.99/year" : "$9.99/month";
  const features = PLAN_FEATURES[planKey];

  /* ── Loading state ────────────────────────────────────────────────────── */
  if (status === "loading") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full border-2 border-primary/30 border-t-primary mx-auto animate-spin" />
          <p className="text-muted-foreground text-sm animate-pulse">Confirming your subscription…</p>
        </div>
      </div>
    );
  }

  /* ── Main page ────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full space-y-8">

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/20 flex items-center justify-center">
              <FiCheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-background shadow-md">
              <AiFillStar className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">You&apos;re all set!</h1>
            {status === "active" ? (
              <p className="text-muted-foreground">
                Your{" "}
                <span className="font-semibold text-foreground">{planLabel} plan</span>{" "}
                is now active. Enjoy full access to CinePortal.
              </p>
            ) : (
              <p className="text-muted-foreground">
                Your payment was received. Subscription activation may take a few moments.
              </p>
            )}
          </div>
        </div>

        {/* Plan details / processing notice */}
        {status === "active" && subscription ? (
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{planLabel} Plan</span>
                <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-xs">
                  Active
                </Badge>
              </div>
              <span className="text-sm font-bold text-green-400">{planPrice}</span>
            </div>

            {subscription.currentPeriodEnd && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-green-500/10 pt-3">
                <FiCalendar className="w-4 h-4 shrink-0" />
                <span>
                  {subscription.cancelAtPeriodEnd ? "Access until" : "Next billing date"}:{" "}
                  <span className="text-foreground font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                      month: "long", day: "numeric", year: "numeric",
                    })}
                  </span>
                </span>
              </div>
            )}

            <div className="border-t border-green-500/10 pt-4 space-y-2.5">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm">
                  <FiCheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-start gap-3">
            <FiClock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm mb-0.5">Processing your subscription</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This usually takes a few seconds. Visit your{" "}
                <Link href="/dashboard/subscription" className="text-primary hover:underline">
                  Dashboard
                </Link>{" "}
                to confirm your plan is active.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 h-7 text-xs gap-1.5"
                onClick={() => window.location.reload()}
              >
                <FiRefreshCw className="w-3 h-3" /> Refresh
              </Button>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1 gap-2" asChild>
            <Link href="/movies">
              Browse Premium Content
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/dashboard/subscription">View Subscription</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
