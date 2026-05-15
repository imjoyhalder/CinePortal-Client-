"use client";

import { useState, useEffect } from "react";
import {
  FiCheckCircle, FiXCircle, FiAlertCircle, FiCalendar,
  FiDollarSign, FiSearch, FiX,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { AdminSubscription, ApiResponse } from "@/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

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
    return <Badge className="bg-purple-500/15 text-purple-500 border-purple-500/30 border text-[10px] px-1.5 py-0 font-medium">{PLAN_LABEL[plan] ?? plan}</Badge>;
  if (plan === "MONTHLY")
    return <Badge className="bg-green-500/15 text-green-600 border-green-500/30 border text-[10px] px-1.5 py-0 font-medium">{PLAN_LABEL[plan] ?? plan}</Badge>;
  return <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">{PLAN_LABEL[plan] ?? plan}</Badge>;
}

function StatusBadge({ status, cancelAtPeriodEnd }: { status: string; cancelAtPeriodEnd: boolean }) {
  if (cancelAtPeriodEnd)
    return (
      <div className="flex items-center gap-1.5">
        <FiAlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="text-xs font-medium text-amber-600">Cancelling</span>
      </div>
    );
  if (status === "ACTIVE")
    return (
      <div className="flex items-center gap-1.5">
        <FiCheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
        <span className="text-xs font-medium text-green-600">Active</span>
      </div>
    );
  return (
    <div className="flex items-center gap-1.5">
      <FiXCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
      <span className="text-xs font-medium text-muted-foreground">{status}</span>
    </div>
  );
}

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function PaginationBar({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }
  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
      {pages.map((p, i) =>
        p === "…"
          ? <span key={`e-${i}`} className="px-2 text-muted-foreground text-sm">…</span>
          : <Button key={p} size="sm" variant={p === page ? "default" : "outline"} className="w-9" onClick={() => onChange(p as number)}>{p}</Button>
      )}
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</Button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const LIMIT = 20;

interface SummaryStats { monthly: number; yearly: number; cancelling: number }

export default function AdminSubscriptionsClient() {
  const [subs, setSubs]       = useState<AdminSubscription[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [summary, setSummary] = useState<SummaryStats | null>(null);

  const [search, setSearch]           = useState("");
  const [debouncedSearch, setDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [planFilter, setPlanFilter]     = useState("ALL");

  // Derived loading pattern — no synchronous setState in effect
  const requestKey = `${page}|${statusFilter}|${planFilter}|${debouncedSearch}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = requestKey !== loadedKey;

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch global summary counts once — independent of table filters/loading
  useEffect(() => {
    api.get<ApiResponse<{ stats: { monthlySubscriptions: number; yearlySubscriptions: number } }>>("/admin/dashboard")
      .then((res) => {
        const stats = res.data?.stats;
        if (!stats) return;
        setSummary((prev) => ({
          monthly: stats.monthlySubscriptions,
          yearly: stats.yearlySubscriptions,
          cancelling: prev?.cancelling ?? 0,
        }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (planFilter   !== "ALL") params.set("plan",   planFilter);
    if (debouncedSearch)        params.set("search", debouncedSearch);

    api.get<ApiResponse<AdminSubscription[]>>(`/admin/subscriptions?${params}`)
      .then((res) => {
        if (cancelled) return;
        const data = res.data ?? [];
        setSubs(data);
        setTotal(res.meta?.total ?? 0);
        setLoadedKey(requestKey);
        // Update cancelling count from ACTIVE page results
        if (statusFilter === "ACTIVE") {
          setSummary((prev) => prev
            ? { ...prev, cancelling: data.filter((s) => s.cancelAtPeriodEnd).length }
            : null
          );
        }
      })
      .catch(() => {
        if (cancelled) return;
        setSubs([]);
        setLoadedKey(requestKey);
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const totalPages = Math.ceil(total / LIMIT);
  const startIndex = (page - 1) * LIMIT;
  const hasFilters = search || statusFilter !== "ACTIVE" || planFilter !== "ALL";

  function clearFilters() {
    setSearch(""); setStatusFilter("ACTIVE"); setPlanFilter("ALL"); setPage(1);
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">{total.toLocaleString()} total</p>
        </div>
        {summary !== null && (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 w-fit">
            <FiDollarSign className="w-4 h-4" />
            ${(summary.monthly * 9.99 + summary.yearly * (79.99 / 12)).toFixed(0)} est. MRR
          </div>
        )}
      </div>

      {/* Summary cards — always visible, sourced independently of table filter/loading */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <MdVerified className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Monthly Pro</span>
            </div>
            {summary === null
              ? <Skeleton className="h-8 w-12 mt-1" />
              : <p className="text-2xl font-bold">{summary.monthly}</p>}
            <p className="text-xs text-green-600 mt-0.5">$9.99 / month each</p>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <MdVerified className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Annual Premium</span>
            </div>
            {summary === null
              ? <Skeleton className="h-8 w-12 mt-1" />
              : <p className="text-2xl font-bold">{summary.yearly}</p>}
            <p className="text-xs text-purple-600 mt-0.5">$79.99 / year each</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/5 col-span-2 sm:col-span-1">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <FiAlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Cancelling</span>
            </div>
            {summary === null
              ? <Skeleton className="h-8 w-12 mt-1" />
              : <p className="text-2xl font-bold">{summary.cancelling}</p>}
            <p className="text-xs text-amber-600 mt-0.5">at period end</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-52">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="ALL">All Plans</option>
          <option value="MONTHLY">Monthly Pro</option>
          <option value="YEARLY">Annual Premium</option>
          <option value="FREE">Free</option>
        </select>

        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground hover:text-foreground" onClick={clearFilters}>
            <FiX className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border/60">
              <tr>
                <th className="px-4 py-3 text-left w-10 text-xs font-semibold uppercase tracking-wide text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">
                  <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" /> Started</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden lg:table-cell">
                  <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" /> Renews / Ends</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="bg-background">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-6" /></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Skeleton className="w-8 h-8 rounded-full shrink-0" /><div className="space-y-1"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-36 hidden sm:block" /></div></div></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-24" /></td>
                  </tr>
                ))
              ) : subs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <FiDollarSign className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No subscriptions found.</p>
                  </td>
                </tr>
              ) : (
                subs.map((sub, i) => (
                  <tr key={sub.id} className="bg-background hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{startIndex + i + 1}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 min-w-0">
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

                    <td className="px-4 py-3"><PlanBadge plan={sub.plan} /></td>

                    <td className="px-4 py-3 hidden sm:table-cell">
                      <StatusBadge status={sub.status} cancelAtPeriodEnd={sub.cancelAtPeriodEnd} />
                    </td>

                    <td className="px-4 py-3 hidden sm:table-cell text-xs font-semibold">
                      {PLAN_PRICE[sub.plan] ?? "—"}
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                      {fmt(sub.currentPeriodStart)}
                    </td>

                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                      {fmt(sub.currentPeriodEnd)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      {!loading && subs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Showing {startIndex + 1}–{Math.min(startIndex + LIMIT, total)} of {total} subscriptions
          </p>
          <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
