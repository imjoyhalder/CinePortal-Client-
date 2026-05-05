"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiCheck, FiX, FiZap, FiGift, FiAward, FiStar, FiUsers, FiLock } from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import { MdVerified } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CheckoutButton from "@/components/payment/checkout-button";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import type { ApiResponse, Subscription } from "@/types";

const COMPARISON_ROWS = [
  { label: "Browse movies & series",      free: true,  monthly: true,  yearly: true  },
  { label: "Read reviews",                free: true,  monthly: true,  yearly: true  },
  { label: "Create watchlist",            free: true,  monthly: true,  yearly: true  },
  { label: "Write reviews (1/month cap)", free: true,  monthly: false, yearly: false },
  { label: "Unlimited reviews",           free: false, monthly: true,  yearly: true  },
  { label: "Premium content",             free: false, monthly: true,  yearly: true  },
  { label: "Ad-free experience",          free: false, monthly: true,  yearly: true  },
  { label: "Download for offline",        free: false, monthly: false, yearly: true  },
  { label: "Priority support",            free: false, monthly: false, yearly: true  },
  { label: "Early access to new titles",  free: false, monthly: false, yearly: true  },
];

function CheckIcon({ active }: { active: boolean }) {
  return active
    ? <FiCheck className="w-4 h-4 text-green-400 mx-auto" />
    : <FiX className="w-4 h-4 text-muted-foreground/35 mx-auto" />;
}

export default function PricingSection() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  // undefined = still loading, null = not subscribed / failed
  const [subscription, setSubscription] = useState<Subscription | null | undefined>(undefined);

  useEffect(() => {
    if (!session?.user) { setSubscription(null); return; }
    if (isAdmin)         { setSubscription(null); return; }

    api
      .get<ApiResponse<Subscription>>("/payments/subscription")
      .then((r) => setSubscription(r.data ?? null))
      .catch(() => setSubscription(null));
  }, [session?.user, isAdmin]);

  const activePlan = subscription?.status === "ACTIVE" ? subscription.plan : "FREE";

  /* ── Helper: current-plan badge ──────────────────────────────────────── */
  function CurrentBadge() {
    return (
      <div className="flex items-center justify-center gap-1.5 w-full h-10 rounded-md border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium">
        <MdVerified className="w-4 h-4" />
        Current Plan
      </div>
    );
  }

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-5">
            <FiZap className="w-3.5 h-3.5" />
            SIMPLE PRICING
          </div>
          <h2 className="text-4xl font-bold mb-3">
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-500">
              Plan
            </span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start free. Upgrade for unlimited access. Cancel anytime.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">

          {/* ── Free ─────────────────────────────────────────────────────── */}
          <Card className="relative flex flex-col border-border/50">
            <CardHeader className="pb-4">
              <div className="w-11 h-11 rounded-full bg-green-500/15 flex items-center justify-center mb-4">
                <FiGift className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-xl font-bold">Free</h3>
              <p className="text-sm text-muted-foreground">Perfect for casual viewers</p>
              <div className="flex items-end gap-1 mt-3">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground text-sm mb-1">/forever</span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-2.5">
              {["Browse movies & series", "Read all reviews", "Create watchlist", "1 review per month", "Basic search & filters"].map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm">
                  <FiCheck className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
              {["Unlimited reviews", "Premium content", "Priority support"].map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm text-muted-foreground/40">
                  <FiX className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="line-through">{f}</span>
                </div>
              ))}
            </CardContent>

            <CardFooter className="pt-4">
              {activePlan === "FREE" && session?.user ? (
                <CurrentBadge />
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/sign-up">Get Started Free</Link>
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* ── Monthly (Pro) ─────────────────────────────────────────────── */}
          <Card className="relative flex flex-col border-primary shadow-lg shadow-primary/20">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 shadow font-semibold tracking-wide">
                MOST POPULAR
              </Badge>
            </div>

            <CardHeader className="pb-4">
              <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center mb-4">
                <FiAward className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Monthly Pro</h3>
              <p className="text-sm text-muted-foreground">For dedicated film enthusiasts</p>
              <div className="flex items-end gap-1 mt-3">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-muted-foreground text-sm mb-1">/month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Billed monthly · cancel anytime</p>
            </CardHeader>

            <CardContent className="flex-1 space-y-2.5">
              {[
                "Everything in Free",
                "Unlimited reviews & comments",
                "Access premium content",
                "Ad-free experience",
                "Advanced filters",
                "Email notifications",
              ].map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm">
                  <FiCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </CardContent>

            <CardFooter className="pt-4">
              {isAdmin ? (
                <Button variant="default" className="w-full opacity-60" disabled>
                  Admin Access Included
                </Button>
              ) : activePlan === "MONTHLY" ? (
                <CurrentBadge />
              ) : (
                <CheckoutButton plan="MONTHLY" variant="default" className="w-full">
                  Start Monthly Pro
                </CheckoutButton>
              )}
            </CardFooter>
          </Card>

          {/* ── Annual (Premium) ─────────────────────────────────────────── */}
          <Card className="relative flex flex-col border-purple-500/40">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge className="bg-purple-600 text-white px-3 shadow font-semibold tracking-wide">
                BEST VALUE
              </Badge>
            </div>

            <CardHeader className="pb-4">
              <div className="w-11 h-11 rounded-full bg-purple-500/15 flex items-center justify-center mb-4">
                <FiStar className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold">Annual Premium</h3>
              <p className="text-sm text-muted-foreground">Best value for power users</p>
              <div className="flex items-end gap-1 mt-3">
                <span className="text-4xl font-bold">$6.67</span>
                <span className="text-muted-foreground text-sm mb-1">/month</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">Billed $79.99/year</p>
                <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-xs px-1.5 py-0 leading-none">
                  Save 33%
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-2.5">
              {[
                "Everything in Monthly",
                "2 months free",
                "Priority support",
                "Early access to new titles",
                "Download for offline viewing",
                "Ad-free experience",
              ].map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm">
                  <FiCheck className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </CardContent>

            <CardFooter className="pt-4">
              {isAdmin ? (
                <Button className="w-full bg-purple-600 text-white opacity-60" disabled>
                  Admin Access Included
                </Button>
              ) : activePlan === "YEARLY" ? (
                <CurrentBadge />
              ) : (
                <CheckoutButton
                  plan="YEARLY"
                  variant="default"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Start Annual Premium
                </CheckoutButton>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Comparison table */}
        <div className="max-w-5xl mx-auto mb-16">
          <h3 className="text-lg font-semibold text-center mb-6">Compare Plans</h3>
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-card">
                  <th className="text-left px-5 py-3.5 font-medium text-muted-foreground">Feature</th>
                  <th className="text-center px-5 py-3.5 font-semibold">Free</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-primary">Monthly</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-purple-400">Annual</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.label}
                    className={`border-b border-border/30 last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-card/40"}`}
                  >
                    <td className="px-5 py-3.5 text-muted-foreground">{row.label}</td>
                    <td className="px-5 py-3.5 text-center"><CheckIcon active={row.free} /></td>
                    <td className="px-5 py-3.5 text-center"><CheckIcon active={row.monthly} /></td>
                    <td className="px-5 py-3.5 text-center"><CheckIcon active={row.yearly} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust badges */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-xl border border-border/50 bg-card p-5 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">25K+</p>
              <p className="text-sm text-muted-foreground">Happy Users</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-5 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <AiFillStar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">4.8</p>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <AiFillStar key={i} className="w-3.5 h-3.5 text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Average Rating</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-5 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FiLock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-sm text-muted-foreground">Secure & Trusted</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
