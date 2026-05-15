"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiShoppingBag, FiCreditCard, FiCalendar, FiCheckCircle,
  FiClock, FiAlertCircle, FiArrowRight, FiPackage,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import type { ApiResponse, User } from "@/types";

// ── helpers ──────────────────────────────────────────────────────────────

function fmt(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function fmtShort(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const PLAN_META: Record<string, { label: string; price: string; period: string; color: string; bg: string }> = {
  MONTHLY: { label: "Monthly Pro",    price: "$9.99",  period: "/ month", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  YEARLY:  { label: "Annual Premium", price: "$79.99", period: "/ year",  color: "text-violet-500",  bg: "bg-violet-500/10 border-violet-500/20"   },
  FREE:    { label: "Free Plan",      price: "$0",     period: "forever", color: "text-slate-400",   bg: "bg-slate-500/10 border-slate-500/20"     },
  ADMIN:   { label: "Admin Access",   price: "N/A",    period: "",        color: "text-primary",     bg: "bg-primary/10 border-primary/20"         },
};

const STATUS_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  ACTIVE:     { icon: FiCheckCircle,  label: "Active",    color: "text-emerald-500" },
  CANCELLED:  { icon: FiAlertCircle,  label: "Cancelled", color: "text-destructive" },
  PAST_DUE:   { icon: FiAlertCircle,  label: "Past Due",  color: "text-amber-500"   },
  INCOMPLETE: { icon: FiClock,        label: "Pending",   color: "text-amber-500"   },
};

// ── component ────────────────────────────────────────────────────────────

export default function PurchasesClient() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionLoading && !session) { router.push("/sign-in"); return; }
    if (!session) return;
    api.get<ApiResponse<User>>("/users/profile")
      .then((r) => setProfile(r.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, sessionLoading, router]);

  if (sessionLoading || loading) return <PurchasesSkeleton />;

  const sub = profile?.subscription ?? null;
  const plan = sub?.plan ?? "FREE";
  const meta = PLAN_META[plan] ?? PLAN_META.FREE;
  const statusCfg = STATUS_CONFIG[sub?.status ?? ""] ?? null;
  const isPaid = plan !== "FREE" && plan !== "ADMIN";
  const isAdmin = plan === "ADMIN" || profile?.role === "ADMIN";

  return (
    <div className="space-y-8 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FiShoppingBag className="text-primary" /> Purchase History
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View your active plan and billing records.
        </p>
      </div>

      {/* Current plan card */}
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="bg-muted/5 border-b py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FiPackage className="text-primary" /> Current Plan
          </CardTitle>
          {sub?.status && statusCfg && (
            <Badge variant="outline" className={`gap-1.5 text-xs font-bold ${statusCfg.color}`}>
              <statusCfg.icon className="w-3 h-3" /> {statusCfg.label}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-bold ${meta.bg} ${meta.color}`}>
              <MdVerified className="w-4 h-4" />
              <span>{meta.label}</span>
            </div>
            <div className="text-left">
              <span className="text-3xl font-black tracking-tight">{meta.price}</span>
              <span className="text-muted-foreground text-sm ml-1">{meta.period}</span>
            </div>
          </div>

          {isPaid && sub && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
                <FiCalendar className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Started</p>
                  <p className="text-sm font-semibold mt-0.5">{fmt(sub.currentPeriodStart)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
                <FiClock className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Period</p>
                  <p className="text-sm font-semibold mt-0.5">
                    {fmtShort(sub.currentPeriodStart)} — {fmtShort(sub.currentPeriodEnd)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
                <FiCheckCircle className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {sub.cancelAtPeriodEnd ? "Expires" : "Renews"}
                  </p>
                  <p className={`text-sm font-semibold mt-0.5 ${sub.cancelAtPeriodEnd ? "text-destructive" : "text-emerald-500"}`}>
                    {fmt(sub.currentPeriodEnd)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isAdmin && (
            <p className="mt-4 text-sm text-muted-foreground">
              Admin accounts have full platform access and are not billed.
            </p>
          )}

          {!isPaid && !isAdmin && (
            <p className="mt-4 text-sm text-muted-foreground">
              You&apos;re on the free plan. Upgrade to unlock premium content.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Billing record — show single entry if paid */}
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="bg-muted/5 border-b py-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FiCreditCard className="text-primary" /> Billing Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isPaid && sub ? (
            <div className="divide-y divide-border/40">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${meta.bg}`}>
                    <FiShoppingBag className={`w-4 h-4 ${meta.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{meta.label} Subscription</p>
                    <p className="text-xs text-muted-foreground">
                      Billing period: {fmtShort(sub.currentPeriodStart)} — {fmtShort(sub.currentPeriodEnd)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black">{meta.price}</p>
                  <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30 bg-emerald-500/10 mt-1">
                    Paid
                  </Badge>
                </div>
              </div>
              <div className="px-6 py-3 bg-muted/20 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Full payment receipts are sent to <span className="font-semibold text-foreground">{profile?.email}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-6">
              <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
                <FiShoppingBag className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-semibold text-sm">No purchases yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Subscribe to a paid plan to unlock all premium content and see your billing history here.
                </p>
              </div>
              <Button size="sm" asChild>
                <Link href="/dashboard/subscription">
                  View Plans <FiArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PurchasesSkeleton() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="rounded-xl border border-border/40 overflow-hidden">
        <div className="border-b p-4"><Skeleton className="h-4 w-32" /></div>
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-40 rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border/40 overflow-hidden">
        <div className="border-b p-4"><Skeleton className="h-4 w-36" /></div>
        <div className="p-6 space-y-3">
          {[0, 1].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}
