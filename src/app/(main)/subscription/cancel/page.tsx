import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft, FiX, FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Checkout Cancelled — CinePortal" };

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
            <FiX className="w-9 h-9 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">No worries</h1>
            <p className="text-muted-foreground">
              Checkout was cancelled — your current plan is unchanged.
              You can upgrade whenever you&apos;re ready.
            </p>
          </div>
        </div>

        {/* Plan comparison mini-cards */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-5">
          <p className="font-semibold text-sm">What you&apos;re missing out on:</p>

          <div className="grid grid-cols-2 gap-3">
            {/* Monthly card */}
            <div className="rounded-xl border border-border/50 bg-background p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Monthly Pro</p>
                <p className="text-2xl font-bold leading-none">$9.99</p>
                <p className="text-xs text-muted-foreground mt-0.5">per month</p>
              </div>
              <div className="space-y-1">
                {["Unlimited reviews", "Premium content"].map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FiCheck className="w-3 h-3 text-green-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Annual card */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3 relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                  Save 33%
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Annual Premium</p>
                <p className="text-2xl font-bold leading-none">$6.67</p>
                <p className="text-xs text-muted-foreground mt-0.5">per month</p>
                <p className="text-xs text-primary/70 mt-0.5">Billed $79.99/year</p>
              </div>
              <div className="space-y-1">
                {["All Monthly features", "Priority support"].map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FiCheck className="w-3 h-3 text-green-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button className="w-full" asChild>
            <Link href="/#pricing">View All Plans</Link>
          </Button>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <FiArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
