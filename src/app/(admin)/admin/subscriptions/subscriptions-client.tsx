"use client";

import { useState, useEffect } from "react";
import {
  FiCheckCircle, FiXCircle, FiAlertCircle, FiCalendar,
  FiDollarSign, FiLoader,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import type { AdminSubscription, ApiResponse } from "@/types";

// ── helpers ────────────────────────────────────────────────────────────────

const PLAN_LABEL: Record<string, string> = {
  FREE:    "Free",
  MONTHLY: "Monthly Pro",
  YEARLY:  "Annual Premium",
};

const PLAN_PRICE: Record<string, string> = {
  MONTHLY: "$9.99/mo",
  YEARLY:  "$79.99/yr",
  FREE:    "—",
};

function PlanBadge({ plan }: { plan: string }) {
  if (plan === "YEARLY")
    return <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-xs">{PLAN_LABEL[plan] ?? plan}</Badge>;
  if (plan === "MONTHLY")
    return <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-xs">{PLAN_LABEL[plan] ?? plan}</Badge>;
  return <Badge variant="secondary" className="text-xs">{PLAN_LABEL[plan] ?? plan}</Badge>;
}

function StatusIcon({ status, cancelAtPeriodEnd }: { status: string; cancelAtPeriodEnd: boolean }) {
  if (cancelAtPeriodEnd)
    return <FiAlertCircle className="w-3.5 h-3.5 text-amber-400" title="Cancelling" />;
  if (status === "ACTIVE")
    return <FiCheckCircle className="w-3.5 h-3.5 text-green-400" />;
  return <FiXCircle className="w-3.5 h-3.5 text-red-400" />;
}

function fmt(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── component ──────────────────────────────────────────────────────────────

export default function AdminSubscriptionsClient() {
  const [subs,    setSubs]    = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [status,  setStatus]  = useState("ACTIVE");
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);

  const LIMIT = 20;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
        if (status !== "ALL") params.set("status", status);
        const res = await api.get<ApiResponse<AdminSubscription[]>>(`/admin/subscriptions?${params}`);
        if (!cancelled) {
          setSubs(res.data ?? []);
          setTotal(res.meta?.total ?? 0);
        }
      } catch {
        if (!cancelled) setSubs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [status, page]);

  const totalPages = Math.ceil(total / LIMIT);

  // Estimated MRR for the current filter
  const mrr = subs.reduce((sum, s) => {
    if (s.plan === "MONTHLY") return sum + 9.99;
    if (s.plan === "YEARLY")  return sum + 79.99 / 12;
    return sum;
  }, 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString()} total · {status === "ACTIVE" ? "showing active" : `filtered by ${status.toLowerCase()}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* MRR chip */}
          {status === "ACTIVE" && (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5">
              <FiDollarSign className="w-4 h-4" />
              ${mrr.toFixed(0)} est. MRR
            </div>
          )}

          <Select value={status} onValueChange={(v: string | null) => { if (v) { setStatus(v); setPage(1); } }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Plans</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary cards (active only) */}
      {status === "ACTIVE" && subs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <MdVerified className="w-4 h-4 text-green-400" />
                <span className="text-xs text-muted-foreground">Monthly Pro</span>
              </div>
              <p className="text-2xl font-bold">
                {subs.filter((s) => s.plan === "MONTHLY").length}
              </p>
              <p className="text-xs text-green-400 mt-0.5">$9.99/month each</p>
            </CardContent>
          </Card>
          <Card className="border-purple-500/20 bg-purple-500/5">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <MdVerified className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-muted-foreground">Annual Premium</span>
              </div>
              <p className="text-2xl font-bold">
                {subs.filter((s) => s.plan === "YEARLY").length}
              </p>
              <p className="text-xs text-purple-400 mt-0.5">$79.99/year each</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20 bg-amber-500/5 col-span-2 sm:col-span-1">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <FiAlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-muted-foreground">Cancelling</span>
              </div>
              <p className="text-2xl font-bold">
                {subs.filter((s) => s.cancelAtPeriodEnd).length}
              </p>
              <p className="text-xs text-amber-400 mt-0.5">at period end</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-card rounded-xl animate-pulse border border-border/50" />
          ))}
        </div>
      ) : subs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <FiLoader className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p>No subscriptions found.</p>
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    <th className="text-left text-xs text-muted-foreground font-medium px-5 py-3">User</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-3">Plan</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-3">Status</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-3 hidden sm:table-cell">Price</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-3 hidden md:table-cell">
                      <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" /> Started</span>
                    </th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-3 pr-5 hidden md:table-cell">
                      <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" /> Renews / Ends</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((sub) => (
                    <tr key={sub.id} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarImage src={sub.user.image ?? undefined} alt={sub.user.name} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {sub.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{sub.user.name}</p>
                            <p className="text-xs text-muted-foreground truncate hidden sm:block">{sub.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <PlanBadge plan={sub.plan} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <StatusIcon status={sub.status} cancelAtPeriodEnd={sub.cancelAtPeriodEnd} />
                          <span className="text-xs font-medium">
                            {sub.cancelAtPeriodEnd ? "Cancelling" : sub.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <span className="text-xs font-semibold text-foreground">
                          {PLAN_PRICE[sub.plan] ?? "—"}
                        </span>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell text-xs text-muted-foreground">
                        {fmt(sub.currentPeriodStart)}
                      </td>
                      <td className="px-3 py-3 pr-5 hidden md:table-cell text-xs text-muted-foreground">
                        {fmt(sub.currentPeriodEnd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
