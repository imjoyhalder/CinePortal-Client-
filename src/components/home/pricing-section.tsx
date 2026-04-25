"use client";

import { useState } from "react";
import Link from "next/link";
import { FiCheck, FiZap } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CheckoutButton from "@/components/payment/checkout-button";

const plans = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for casual viewers",
    badge: null,
    features: [
      "Browse movies & series",
      "Read all reviews",
      "Create watchlist",
      "1 review per month",
      "Basic search & filters",
    ],
    excluded: ["Unlimited reviews", "Premium content", "Priority support"],
    cta: "Get Started Free",
    checkoutPlan: null as null | "MONTHLY" | "YEARLY",
    href: "/sign-up",
    variant: "outline" as const,
  },
  {
    name: "Monthly",
    price: { monthly: 9.99, yearly: 119.88 },
    description: "For dedicated film enthusiasts",
    badge: "Most Popular",
    features: [
      "Everything in Free",
      "Unlimited reviews & comments",
      "Access premium content",
      "Stream exclusive titles",
      "Advanced filters",
      "Email notifications",
    ],
    excluded: [],
    cta: "Start Monthly",
    checkoutPlan: "MONTHLY" as const,
    href: null,
    variant: "default" as const,
  },
  {
    name: "Yearly",
    price: { monthly: 7.99, yearly: 95.88 },
    description: "Best value for power users",
    badge: "Save 20%",
    features: [
      "Everything in Monthly",
      "2 months free",
      "Priority support",
      "Early access to new titles",
      "Download for offline viewing",
      "Ad-free experience",
    ],
    excluded: [],
    cta: "Start Yearly",
    checkoutPlan: "YEARLY" as const,
    href: null,
    variant: "default" as const,
  },
];

export default function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-4">
            <FiZap className="w-3.5 h-3.5" />
            Simple Pricing
          </div>
          <h2 className="text-3xl font-bold mb-3">Choose Your Plan</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start free, upgrade when you&apos;re ready. Cancel anytime.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setBilling("monthly")}
              className={`text-sm font-medium transition-colors ${billing === "monthly" ? "text-foreground" : "text-muted-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
              className={`w-10 h-5 rounded-full transition-colors relative ${billing === "yearly" ? "bg-primary" : "bg-muted"}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${billing === "yearly" ? "translate-x-5" : "translate-x-0.5"}`}
              />
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`text-sm font-medium transition-colors ${billing === "yearly" ? "text-foreground" : "text-muted-foreground"}`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col border-border/50 ${
                plan.badge === "Most Popular"
                  ? "border-primary/50 shadow-lg shadow-primary/10 scale-[1.02]"
                  : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 shadow">{plan.badge}</Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-4xl font-bold">
                    ${billing === "monthly" ? plan.price.monthly : plan.price.yearly}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-muted-foreground text-sm mb-1">
                      /{billing === "monthly" ? "mo" : "yr"}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-sm">
                    <FiCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
                {plan.excluded.map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-sm text-muted-foreground/50 line-through">
                    <span className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-4">
                {plan.checkoutPlan ? (
                  <CheckoutButton
                    plan={plan.checkoutPlan}
                    variant={plan.variant}
                    className="w-full"
                  >
                    {plan.cta}
                  </CheckoutButton>
                ) : (
                  <Button variant={plan.variant} className="w-full" asChild>
                    <Link href={plan.href!}>{plan.cta}</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
