"use client";

import { useState } from "react";
import Link from "next/link";
import { FiCheck, FiX, FiZap } from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CheckoutButton from "@/components/payment/checkout-button";
import { useSession } from "@/lib/auth-client";

const COMPARISON_ROWS = [
  { label: "Browse movies & series", free: true, pro: true, premium: true },
  { label: "Read reviews", free: true, pro: true, premium: true },
  { label: "Create watchlist", free: true, pro: true, premium: true },
  { label: "Unlimited reviews", free: false, pro: true, premium: true },
  { label: "Premium content", free: false, pro: true, premium: true },
  { label: "Download for offline viewing", free: false, pro: false, premium: true },
  { label: "Priority support", free: false, pro: false, premium: true },
];

export default function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-5">
            <FiZap className="w-3.5 h-3.5" />
            SIMPLE PRICING
          </div>

          <h2 className="text-4xl font-bold mb-3">
            Choose Your{" "}
            <span className="text-gradient">Plan</span>
          </h2>

          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Start free, upgrade when you&apos;re ready. Cancel anytime.
          </p>

          <div className="inline-flex items-center bg-card border border-border/60 rounded-full p-1 gap-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                billing === "monthly"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`relative flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                billing === "yearly"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-xs px-1.5 py-0 leading-none">
                Save 34%
              </Badge>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <Card className="relative flex flex-col border-border/50">
            <CardHeader className="pb-4">
              <div className="w-11 h-11 rounded-full bg-green-500/15 flex items-center justify-center mb-4">
                <span className="text-green-400 text-xl">🎁</span>
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
              <Button variant="outline" className="w-full" asChild>
                <Link href="/sign-up">Get Started Free</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="relative flex flex-col border-primary shadow-lg shadow-primary/20">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 shadow font-semibold tracking-wide">
                MOST POPULAR
              </Badge>
            </div>

            <CardHeader className="pb-4">
              <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center mb-4">
                <span className="text-primary text-xl">👑</span>
              </div>
              <h3 className="text-xl font-bold">Pro</h3>
              <p className="text-sm text-muted-foreground">For dedicated film enthusiasts</p>
              <div className="flex items-end gap-1 mt-3">
                <span className="text-4xl font-bold">
                  {billing === "monthly" ? "$9.99" : "$119.88"}
                </span>
                <span className="text-muted-foreground text-sm mb-1">
                  /{billing === "monthly" ? "month" : "year"}
                </span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-2.5">
              {[
                "Everything in Free",
                "Unlimited reviews & comments",
                "Access premium content",
                "Stream exclusive titles",
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
              ) : (
                <CheckoutButton plan="MONTHLY" variant="default" className="w-full">
                  Start Pro
                </CheckoutButton>
              )}
            </CardFooter>
          </Card>

          <Card className="relative flex flex-col border-purple-500/40">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge className="bg-purple-500 text-white px-3 shadow font-semibold tracking-wide">
                BEST VALUE
              </Badge>
            </div>

            <CardHeader className="pb-4">
              <div className="w-11 h-11 rounded-full bg-purple-500/15 flex items-center justify-center mb-4">
                <span className="text-purple-400 text-xl">⭐</span>
              </div>
              <h3 className="text-xl font-bold">Premium</h3>
              <p className="text-sm text-muted-foreground">Best value for power users</p>
              <div className="flex items-end gap-1 mt-3">
                <span className="text-4xl font-bold">
                  {billing === "monthly" ? "$9.99" : "$7.99"}
                </span>
                <span className="text-muted-foreground text-sm mb-1">/month</span>
              </div>
              {billing === "yearly" && (
                <p className="text-xs text-muted-foreground mt-1">Billed annually $79.99</p>
              )}
            </CardHeader>

            <CardContent className="flex-1 space-y-2.5">
              {[
                "Everything in Pro",
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
              ) : (
                <CheckoutButton
                  plan="YEARLY"
                  variant="default"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Start Premium
                </CheckoutButton>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="max-w-5xl mx-auto mb-16">
          <h3 className="text-lg font-semibold text-center mb-6">Compare Plans</h3>
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-card">
                  <th className="text-left px-5 py-3.5 font-medium text-muted-foreground">Feature</th>
                  <th className="text-center px-5 py-3.5 font-semibold">Free</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-primary">Pro</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-purple-400">Premium</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.label}
                    className={`border-b border-border/30 last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-card/40"}`}
                  >
                    <td className="px-5 py-3.5 text-muted-foreground">{row.label}</td>
                    <td className="px-5 py-3.5 text-center">
                      {row.free
                        ? <FiCheck className="w-4 h-4 text-green-400 mx-auto" />
                        : <FiX className="w-4 h-4 text-muted-foreground/40 mx-auto" />}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {row.pro
                        ? <FiCheck className="w-4 h-4 text-green-400 mx-auto" />
                        : <FiX className="w-4 h-4 text-muted-foreground/40 mx-auto" />}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {row.premium
                        ? <FiCheck className="w-4 h-4 text-green-400 mx-auto" />
                        : <FiX className="w-4 h-4 text-muted-foreground/40 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-xl border border-border/50 bg-card p-5 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
              👥
            </div>
            <div>
              <p className="text-2xl font-bold">25K+</p>
              <p className="text-sm text-muted-foreground">Happy Users</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-5 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
              ⭐
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
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
              🔒
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
