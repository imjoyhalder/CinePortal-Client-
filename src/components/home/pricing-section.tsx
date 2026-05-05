"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiCheck, FiX, FiZap, FiGift, FiAward, FiStar,
  FiUsers, FiLock, FiArrowRight, FiShield,
} from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import { MdVerified } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CheckoutButton from "@/components/payment/checkout-button";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ApiResponse, Subscription, SubscriptionPlan } from "@/types";

type ComparisonValue = boolean | string;

interface ComparisonRow {
  label: string;
  free: ComparisonValue;
  monthly: ComparisonValue;
  yearly: ComparisonValue;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  { label: "Browse movies & series",   free: true,    monthly: true,        yearly: true        },
  { label: "Read reviews",             free: true,    monthly: true,        yearly: true        },
  { label: "Create & manage watchlist",free: true,    monthly: true,        yearly: true        },
  { label: "Write reviews",            free: "1/mo",  monthly: "Unlimited", yearly: "Unlimited" },
  { label: "Comment on reviews",       free: "Free only", monthly: "All",   yearly: "All"       },
  { label: "Premium content access",   free: false,   monthly: true,        yearly: true        },
  { label: "Ad-free experience",       free: false,   monthly: true,        yearly: true        },
  { label: "Advanced filters",         free: false,   monthly: true,        yearly: true        },
  { label: "Priority support",         free: false,   monthly: false,       yearly: true        },
  { label: "Download for offline",     free: false,   monthly: false,       yearly: true        },
  { label: "Early access to titles",   free: false,   monthly: false,       yearly: true        },
  { label: "Exclusive profile badge",  free: false,   monthly: false,       yearly: true        },
];

function CellValue({ value }: { value: ComparisonValue }) {
  if (typeof value === "string") {
    return <span className="text-xs font-semibold text-foreground">{value}</span>;
  }
  return value
    ? <FiCheck className="w-4 h-4 text-emerald-500 mx-auto" />
    : <FiX className="w-4 h-4 text-muted-foreground/25 mx-auto" />;
}

function PlanFeature({ text, included, color = "text-emerald-500" }: {
  text: string;
  included: boolean;
  color?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 text-sm", included ? "text-foreground" : "text-muted-foreground/40")}>
      {included
        ? <FiCheck className={cn("w-4 h-4 shrink-0", color)} />
        : <FiX className="w-4 h-4 shrink-0" />
      }
      <span className={included ? "" : "line-through"}>{text}</span>
    </div>
  );
}

function CurrentPlanBadge({ label = "Current Plan" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 w-full h-12 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-semibold">
      <MdVerified className="w-4 h-4" />
      {label}
    </div>
  );
}

function AdminBadge() {
  return (
    <div className="flex items-center justify-center gap-2 w-full h-12 rounded-md border border-primary/30 bg-primary/10 text-primary text-sm font-semibold">
      <FiShield className="w-4 h-4" />
      Admin Access Included
    </div>
  );
}

export default function PricingSection() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  const [subscription, setSubscription] = useState<Subscription | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!session?.user || isAdmin) {
        if (!cancelled) setSubscription(null);
        return;
      }
      try {
        const r = await api.get<ApiResponse<Subscription>>("/payments/subscription");
        if (!cancelled) setSubscription(r.data ?? null);
      } catch {
        if (!cancelled) setSubscription(null);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [session?.user, isAdmin]);

  const activePlan: SubscriptionPlan | "FREE" =
    subscription?.status === "ACTIVE" ? (subscription.plan as SubscriptionPlan) : "FREE";

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-background">
      {/* Background glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/6 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/6 blur-[140px] rounded-full" />
      </div>

      <div className="container mx-auto px-4">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 border border-primary/20 bg-primary/5 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-5">
            <FiZap className="w-3.5 h-3.5" /> Simple, Transparent Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Choose the plan that <span className="text-primary">fits you</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Start free. Upgrade anytime. Cancel whenever you want — no questions asked.
          </p>
        </div>

        {/* ── Plan Cards ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto mb-20">

          {/* Free */}
          <Card className="flex flex-col border-border/60 bg-card/60 backdrop-blur-sm hover:border-border transition-colors duration-300">
            <CardHeader className="pb-5">
              <div className="w-10 h-10 rounded-xl bg-slate-500/15 flex items-center justify-center mb-4">
                <FiGift className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Free</h3>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-5xl font-black tracking-tighter">$0</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Perfect for casual viewers who want to explore and track what they watch.
              </p>
            </CardHeader>
            <CardContent className="flex-1 space-y-3.5">
              <PlanFeature text="Browse all movies & series" included />
              <PlanFeature text="Create a personal watchlist" included />
              <PlanFeature text="1 review per month" included />
              <PlanFeature text="Comment on free content" included />
              <PlanFeature text="Unlimited reviews" included={false} />
              <PlanFeature text="Premium content access" included={false} />
              <PlanFeature text="Ad-free experience" included={false} />
            </CardContent>
            <CardFooter className="pt-4">
              {isAdmin ? (
                <AdminBadge />
              ) : activePlan !== "FREE" ? (
                <Button variant="outline" className="w-full h-11" asChild>
                  <Link href="/sign-up">Current (Free) Plan</Link>
                </Button>
              ) : session ? (
                <CurrentPlanBadge label="Your Current Plan" />
              ) : (
                <Button variant="outline" className="w-full h-11" asChild>
                  <Link href="/sign-up">Get Started Free</Link>
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Monthly Pro — featured */}
          <Card className="flex flex-col relative border-2 border-primary bg-card shadow-2xl shadow-primary/15 lg:scale-[1.03] z-10">
            <div className="absolute -top-4 inset-x-0 flex justify-center">
              <Badge className="bg-primary hover:bg-primary text-primary-foreground font-bold px-4 py-1 uppercase tracking-widest text-[10px] shadow-lg shadow-primary/30">
                Most Popular
              </Badge>
            </div>
            <CardHeader className="pb-5 pt-8">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                <FiAward className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Monthly Pro</h3>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-5xl font-black tracking-tighter">$9.99</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                The full experience for dedicated film fans and active reviewers.
              </p>
            </CardHeader>
            <CardContent className="flex-1 space-y-3.5">
              <PlanFeature text="Everything in Free" included color="text-primary" />
              <PlanFeature text="Unlimited reviews & comments" included color="text-primary" />
              <PlanFeature text="Access all premium content" included color="text-primary" />
              <PlanFeature text="Ad-free experience" included color="text-primary" />
              <PlanFeature text="Advanced filter tools" included color="text-primary" />
              <PlanFeature text="Priority email support" included color="text-primary" />
              <PlanFeature text="Download for offline" included={false} />
            </CardContent>
            <CardFooter className="pt-4">
              {isAdmin ? (
                <AdminBadge />
              ) : activePlan === "MONTHLY" ? (
                <CurrentPlanBadge />
              ) : (
                <CheckoutButton
                  plan="MONTHLY"
                  className="w-full h-11 font-semibold shadow-lg shadow-primary/25 group"
                >
                  Start Monthly Pro
                  <FiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </CheckoutButton>
              )}
            </CardFooter>
          </Card>

          {/* Annual Premium */}
          <Card className="flex flex-col border-purple-500/40 bg-card/60 backdrop-blur-sm hover:border-purple-500/60 transition-colors duration-300">
            <CardHeader className="pb-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <FiStar className="w-5 h-5 text-purple-400" />
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-xs font-bold px-2.5">
                  Save 33%
                </Badge>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Annual Premium</h3>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-5xl font-black tracking-tighter">$6.67</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Billed $79.99/year — 2 months free</p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Maximum value for power users and collectors who want every feature.
              </p>
            </CardHeader>
            <CardContent className="flex-1 space-y-3.5">
              <PlanFeature text="Everything in Monthly" included color="text-purple-400" />
              <PlanFeature text="2 months free annually" included color="text-purple-400" />
              <PlanFeature text="Download for offline viewing" included color="text-purple-400" />
              <PlanFeature text="Early access to new titles" included color="text-purple-400" />
              <PlanFeature text="Exclusive profile badge" included color="text-purple-400" />
              <PlanFeature text="Priority support" included color="text-purple-400" />
            </CardContent>
            <CardFooter className="pt-4">
              {isAdmin ? (
                <AdminBadge />
              ) : activePlan === "YEARLY" ? (
                <CurrentPlanBadge />
              ) : (
                <CheckoutButton
                  plan="YEARLY"
                  variant="outline"
                  className="w-full h-11 border-purple-500/30 hover:bg-purple-500/5 hover:border-purple-500/60 hover:text-purple-400 transition-colors"
                >
                  Start Annual Premium
                </CheckoutButton>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* ── Comparison Table ────────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto mb-20">
          <h3 className="text-2xl font-bold text-center mb-8">Full Feature Comparison</h3>
          <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-sm">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/40">
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Feature</th>
                  <th className="px-4 py-4 text-center font-semibold w-24">Free</th>
                  <th className="px-4 py-4 text-center font-semibold text-primary w-28">Pro</th>
                  <th className="px-4 py-4 text-center font-semibold text-purple-400 w-28">Annual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label} className="hover:bg-muted/15 transition-colors">
                    <td className="px-6 py-3.5 text-muted-foreground">{row.label}</td>
                    <td className="px-4 py-3.5 text-center"><CellValue value={row.free} /></td>
                    <td className="px-4 py-3.5 text-center bg-primary/3"><CellValue value={row.monthly} /></td>
                    <td className="px-4 py-3.5 text-center"><CellValue value={row.yearly} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Trust Badges ────────────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              icon: <FiUsers className="w-6 h-6 text-primary" />,
              stat: "25K+",
              label: "Happy Users",
              bg: "bg-primary/10",
            },
            {
              icon: <AiFillStar className="w-6 h-6 text-amber-400" />,
              stat: "4.8",
              label: "Average Rating",
              bg: "bg-amber-400/10",
              extra: (
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <AiFillStar key={i} className="w-3 h-3 text-amber-400" />
                  ))}
                </div>
              ),
            },
            {
              icon: <FiLock className="w-6 h-6 text-green-400" />,
              stat: "100%",
              label: "Secure & Trusted",
              bg: "bg-green-400/10",
            },
          ].map(({ icon, stat, label, bg, extra }) => (
            <div
              key={label}
              className="rounded-xl border border-border/50 bg-card p-6 flex flex-col items-center text-center gap-3"
            >
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", bg)}>
                {icon}
              </div>
              <div>
                <p className="text-2xl font-bold">{stat}</p>
                {extra}
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
