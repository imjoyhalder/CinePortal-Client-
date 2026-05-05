"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiCheckCircle, FiAlertCircle, FiXCircle, FiCalendar,
  FiCreditCard, FiCheck, FiArrowRight, FiTrendingUp, FiLoader, FiShield,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CheckoutButton from "@/components/payment/checkout-button";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { ApiResponse, User, Subscription } from "@/types";

const PLAN_LABEL: Record<string, string> = {
  FREE:    "Free",
  MONTHLY: "Monthly Pro",
  YEARLY:  "Annual Premium",
  ADMIN:   "Admin",
};

const PLAN_FEATURES: Record<"MONTHLY" | "YEARLY", string[]> = {
  MONTHLY: [
    "Unlimited reviews & comments",
    "Access to all premium content",
    "Ad-free experience",
    "Advanced search & filters",
    "Email notifications",
  ],
  YEARLY: [
    "Everything in Monthly Pro",
    "2 months free — save 33%",
    "Priority support",
    "Early access to new titles",
    "Download for offline viewing",
  ],
};

function fmt(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function DashboardSubscriptionClient() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [profile,      setProfile]      = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [cancelling,   setCancelling]   = useState(false);

  useEffect(() => {
    if (!isPending && !session) { router.push("/sign-in"); return; }
    if (!session) return;

    Promise.all([
      api.get<ApiResponse<User>>("/users/profile"),
      api.get<ApiResponse<Subscription | null>>("/payments/subscription"),
    ])
      .then(([profileRes, subRes]) => {
        setProfile(profileRes.data ?? null);
        setSubscription(subRes.data ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, isPending, router]);

  async function handleCancel() {
    if (!confirm("Cancel your subscription? You keep access until the end of the billing period.")) return;
    setCancelling(true);
    try {
      await api.post("/payments/subscription/cancel");
      toast.success("Subscription will cancel at the end of the billing period.");
      setSubscription((prev) => prev ? { ...prev, cancelAtPeriodEnd: true } : prev);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setCancelling(false);
    }
  }

  if (isPending || loading) {
    return (
      <div className="space-y-4 max-w-lg">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!profile) return null;

  const isAdmin      = subscription?.adminAccess === true || profile.role === "ADMIN";
  const plan         = subscription?.plan ?? "FREE";
  const isPaid       = plan !== "FREE" && plan !== "ADMIN";
  const isActive     = subscription?.status === "ACTIVE";
  const isCancelling = subscription?.cancelAtPeriodEnd;
  const isExpired    = !isAdmin && subscription?.status === "CANCELLED" && !!subscription?.currentPeriodStart;

  const daysRemaining =
    isPaid && isActive && subscription?.currentPeriodEnd
      ? Math.max(0, Math.ceil(
          (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / 86_400_000
        ))
      : null;

  const periodProgress =
    isPaid && isActive && subscription?.currentPeriodStart && subscription?.currentPeriodEnd
      ? Math.min(100, Math.round(
          (Date.now() - new Date(subscription.currentPeriodStart).getTime()) /
          (new Date(subscription.currentPeriodEnd).getTime() - new Date(subscription.currentPeriodStart).getTime()) * 100
        ))
      : null;

  return (
    <div className="space-y-6 max-w-lg">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-sm text-muted-foreground">Manage your plan and billing</p>
      </div>

      {/* ── Admin ──────────────────────────────────────────────────────────── */}
      {isAdmin && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <FiShield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Admin Account — Full Access</p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              As an administrator you have unrestricted access to all content and features.
              No subscription is required.
            </p>
          </div>
        </div>
      )}

      {/* ── Active paid ────────────────────────────────────────────────────── */}
      {!isAdmin && isPaid && isActive && (
        <>
          <div className={`rounded-2xl border p-6 space-y-5 ${
            plan === "YEARLY"
              ? "border-purple-500/30 bg-linear-to-br from-purple-500/10 via-purple-500/5 to-transparent"
              : "border-green-500/30 bg-linear-to-br from-green-500/10 via-green-500/5 to-transparent"
          }`}>
            {/* Plan header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  plan === "YEARLY" ? "bg-purple-500/15" : "bg-green-500/15"
                }`}>
                  {plan === "YEARLY" ? "⭐" : "👑"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg leading-tight">{PLAN_LABEL[plan]}</p>
                    <Badge className={`text-xs ${
                      plan === "YEARLY"
                        ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                        : "bg-green-500/15 text-green-400 border-green-500/30"
                    }`}>
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan === "YEARLY" ? "$79.99/year · $6.67/month" : "$9.99/month"}
                  </p>
                </div>
              </div>
              <MdVerified className={`w-6 h-6 shrink-0 ${plan === "YEARLY" ? "text-purple-400" : "text-green-400"}`} />
            </div>

            {/* Billing period progress */}
            {periodProgress !== null && subscription?.currentPeriodStart && subscription?.currentPeriodEnd && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    {new Date(subscription.currentPeriodStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span className={daysRemaining !== null && daysRemaining <= 7 ? "text-amber-400 font-medium" : ""}>
                    {daysRemaining !== null ? `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} left` : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-background/60">
                  <div
                    className={`h-full rounded-full transition-all ${
                      daysRemaining !== null && daysRemaining <= 7 ? "bg-amber-400" :
                      plan === "YEARLY" ? "bg-purple-400" : "bg-green-400"
                    }`}
                    style={{ width: `${periodProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {isCancelling ? "Access until" : "Renews"}{" "}
                  <span className="font-medium text-foreground">{fmt(subscription.currentPeriodEnd)}</span>
                </p>
              </div>
            )}

            {/* Features */}
            <div className="border-t border-white/5 pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Included in your plan</p>
              <div className="grid grid-cols-1 gap-2">
                {(PLAN_FEATURES[plan as "MONTHLY" | "YEARLY"] ?? []).map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm">
                    <FiCheck className={`w-3.5 h-3.5 shrink-0 ${plan === "YEARLY" ? "text-purple-400" : "text-green-400"}`} />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cancelling notice */}
          {isCancelling && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm">
              <FiAlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-200/90 leading-relaxed">
                Your subscription is set to cancel. You&apos;ll keep full access until{" "}
                <strong className="text-amber-200">{fmt(subscription?.currentPeriodEnd)}</strong>{" "}
                — no further charges after that.
              </p>
            </div>
          )}

          {/* Monthly → Annual upsell */}
          {plan === "MONTHLY" && !isCancelling && (
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 flex items-start gap-3">
              <FiTrendingUp className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm mb-0.5">Switch to Annual and save 33%</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Pay $79.99/year instead of $119.88 — that&apos;s 2 months free.
                </p>
                <CheckoutButton plan="YEARLY" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs gap-1.5">
                  Upgrade to Annual Premium
                  <FiArrowRight className="w-3 h-3" />
                </CheckoutButton>
              </div>
            </div>
          )}

          {/* Billing details */}
          <Card className="border-border/50">
            <CardContent className="pt-4 pb-4 space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Billing Details</p>
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-border/30">
                <span className="text-muted-foreground flex items-center gap-1.5"><FiCreditCard className="w-3.5 h-3.5" /> Started</span>
                <span className="font-medium">{fmt(subscription?.currentPeriodStart)}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Status</span>
                <span className="flex items-center gap-1.5 font-medium text-green-400">
                  <FiCheckCircle className="w-3.5 h-3.5" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-1.5">
                <span className="text-muted-foreground">{isCancelling ? "Access until" : "Next payment"}</span>
                <span className="font-medium">{fmt(subscription?.currentPeriodEnd)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Cancel */}
          {!isCancelling && (
            <div>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/60 gap-2"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling && <FiLoader className="w-3.5 h-3.5 animate-spin" />}
                {cancelling ? "Cancelling…" : "Cancel Subscription"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                You&apos;ll keep access until the end of your current billing period.
              </p>
            </div>
          )}
        </>
      )}

      {/* ── Expired ────────────────────────────────────────────────────────── */}
      {!isAdmin && isExpired && !isPaid && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm">
          <FiXCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Your subscription has expired. Upgrade again to restore premium access.
          </p>
        </div>
      )}

      {/* ── Free / upgrade ─────────────────────────────────────────────────── */}
      {!isAdmin && !isPaid && (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <div className="p-5 border-b border-border/40">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center text-xl">🎁</div>
              <div>
                <p className="font-semibold">Free Plan</p>
                <p className="text-xs text-muted-foreground">Limited access · upgrade anytime</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {["Browse movies & series", "Read all reviews", "Create watchlist", "1 review / month"].map((f) => (
                <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FiCheck className="w-3 h-3 text-green-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 space-y-4">
            <p className="font-semibold text-sm">
              {isExpired ? "Reactivate your subscription" : "Unlock the full experience"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/50 bg-background p-3 space-y-2">
                <p className="text-xs font-semibold">Monthly Pro</p>
                <p className="text-xl font-bold">$9.99<span className="text-xs text-muted-foreground font-normal">/mo</span></p>
                <CheckoutButton plan="MONTHLY" size="sm" className="w-full h-8 text-xs">
                  Get Monthly
                </CheckoutButton>
              </div>
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3 space-y-2 relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">Save 33%</span>
                </div>
                <p className="text-xs font-semibold pt-1">Annual Premium</p>
                <div>
                  <p className="text-xl font-bold">$6.67<span className="text-xs text-muted-foreground font-normal">/mo</span></p>
                  <p className="text-xs text-muted-foreground">$79.99 billed annually</p>
                </div>
                <CheckoutButton plan="YEARLY" size="sm" className="w-full h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white">
                  Get Annual
                </CheckoutButton>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Secure payment via Stripe · Cancel anytime
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
