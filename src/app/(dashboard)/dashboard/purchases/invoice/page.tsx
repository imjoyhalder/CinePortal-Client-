"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiPrinter, FiArrowLeft } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import type { ApiResponse, User } from "@/types";

const PLAN_META: Record<string, { label: string; price: string; period: string; color: string }> = {
  MONTHLY: { label: "Monthly Pro Plan",    price: "$9.99",  period: "Monthly Subscription",  color: "text-emerald-600" },
  YEARLY:  { label: "Annual Premium Plan", price: "$79.99", period: "Annual Subscription",   color: "text-violet-600"  },
};

function fmt(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function InvoicePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) { router.push("/sign-in"); return; }
    if (!session) return;
    api.get<ApiResponse<User>>("/users/profile")
      .then((r) => setProfile(r.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, isPending, router]);

  if (isPending || loading) {
    return (
      <div className="max-w-2xl mx-auto p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const sub  = profile?.subscription;
  const plan = sub?.plan ?? "FREE";
  const meta = PLAN_META[plan];

  if (!sub || !meta) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <p className="text-muted-foreground">No paid subscription found.</p>
        <Button asChild size="sm"><Link href="/dashboard/purchases">← Back to Purchases</Link></Button>
      </div>
    );
  }

  const invoiceNumber = `INV-${sub.id?.slice(0, 8).toUpperCase() ?? "000000"}`;
  const invoiceDate   = fmt(sub.currentPeriodStart);

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar — hidden on print */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 print:hidden">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link href="/dashboard/purchases"><FiArrowLeft className="w-4 h-4" /> Back</Link>
        </Button>
        <Button size="sm" className="gap-2" onClick={() => window.print()}>
          <FiPrinter className="w-4 h-4" /> Print / Save PDF
        </Button>
      </div>

      {/* Invoice document */}
      <div className="max-w-2xl mx-auto p-6 md:p-10 print:p-0 print:max-w-full">
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm print:shadow-none print:border-none print:rounded-none">

          {/* Header band */}
          <div className="bg-primary/5 border-b border-border/40 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/powersync.svg" alt="CinePortal" width={36} height={36} style={{ width: 36, height: 36 }} />
              <div>
                <h2 className="text-lg font-black tracking-tight">CinePortal</h2>
                <p className="text-xs text-muted-foreground">Entertainment Platform</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black uppercase tracking-widest text-primary">Invoice</p>
              <p className="text-xs font-mono text-muted-foreground mt-1">{invoiceNumber}</p>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Billed to + date */}
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Billed To</p>
                <p className="font-bold">{profile?.name}</p>
                <p className="text-muted-foreground text-xs">{profile?.email}</p>
              </div>
              <div className="text-right">
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Invoice Date</p>
                  <p className="font-semibold text-sm">{invoiceDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Payment Status</p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-500/10 border border-green-500/30 rounded-full px-2 py-0.5">
                    <MdVerified className="w-3 h-3" /> PAID
                  </span>
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <div className="grid grid-cols-12 bg-muted/40 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span className="col-span-6">Description</span>
                <span className="col-span-3 text-center">Period</span>
                <span className="col-span-3 text-right">Amount</span>
              </div>
              <div className="grid grid-cols-12 px-4 py-4 items-start gap-2">
                <div className="col-span-6">
                  <p className="font-bold text-sm">{meta.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{meta.period}</p>
                </div>
                <div className="col-span-3 text-center text-xs text-muted-foreground leading-relaxed">
                  <span className="block">{fmt(sub.currentPeriodStart)}</span>
                  <span className="block">— {fmt(sub.currentPeriodEnd)}</span>
                </div>
                <p className={`col-span-3 text-right font-black text-xl ${meta.color}`}>{meta.price}</p>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-52 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span><span>{meta.price}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span><span>$0.00</span>
                </div>
                <div className="flex justify-between font-black text-base border-t border-border/50 pt-2">
                  <span>Total</span><span>{meta.price}</span>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="border-t border-border/40 pt-5 text-center">
              <p className="text-xs text-muted-foreground">
                Thank you for subscribing to CinePortal.
                For billing inquiries, contact us at{" "}
                <span className="text-primary font-semibold">support@cineportal.com</span>
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                Invoice {invoiceNumber} · Issued {invoiceDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
