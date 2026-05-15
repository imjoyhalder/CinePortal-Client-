"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  FiUsers, FiMessageSquare, FiClock, FiDollarSign,
  FiTrendingUp, FiTrendingDown, FiStar, FiCalendar,
  FiArrowRight, FiActivity,
} from "react-icons/fi";
import { MdSubscriptions } from "react-icons/md";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
  ChartLegend, ChartLegendContent, type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ApiResponse, DashboardStats, ReviewStatus } from "@/types";
import { SegmentPieChart } from "./dashboard-charts";

// ── Types ────────────────────────────────────────────────────────────────────

type Period = "today" | "7days" | "30days";

const PERIODS: { value: Period; label: string }[] = [
  { value: "today",  label: "Today"   },
  { value: "7days",  label: "7 Days"  },
  { value: "30days", label: "30 Days" },
];

const CHART_CONFIG: ChartConfig = {
  users:         { label: "New Users",         color: "#3b82f6" },
  reviews:       { label: "New Reviews",        color: "#22c55e" },
  subscriptions: { label: "New Subscriptions",  color: "#a855f7" },
};

const STATUS_STYLE: Record<ReviewStatus, { color: string; label: string }> = {
  APPROVED:    { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", label: "Approved"    },
  PENDING:     { color: "text-amber-500 bg-amber-500/10 border-amber-500/20",       label: "Pending"     },
  UNPUBLISHED: { color: "text-destructive bg-destructive/10 border-destructive/20", label: "Unpublished" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function calcTrend(current: number, prev: number) {
  if (prev === 0 && current === 0) return null;
  if (prev === 0) return { pct: 100, up: true };
  const pct = ((current - prev) / prev) * 100;
  return { pct: Math.abs(Math.round(pct)), up: pct >= 0 };
}

function formatPeriodLabel(period: Period) {
  if (period === "today")  return "today";
  if (period === "7days")  return "last 7 days";
  return "last 30 days";
}

// ── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  sub?: string;
  trend?: { pct: number; up: boolean } | null;
}

function StatCard({ title, value, icon: Icon, iconColor, iconBg, sub, trend }: StatCardProps) {
  return (
    <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={cn("p-2 rounded-lg", iconBg)}>
            <Icon className={cn("w-4 h-4", iconColor)} />
          </div>
          {trend != null && (
            <span className={cn("flex items-center gap-0.5 text-[11px] font-bold", trend.up ? "text-emerald-500" : "text-destructive")}>
              {trend.up ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
              {trend.pct}%
            </span>
          )}
        </div>
        <p className="text-2xl font-black tracking-tight font-mono">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">{title}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2"><Skeleton className="h-9 w-52" /><Skeleton className="h-4 w-80" /></div>
        <Skeleton className="h-10 w-64 rounded-full" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/40"><CardContent className="p-5 space-y-3">
            <div className="flex justify-between"><Skeleton className="h-8 w-8 rounded-lg" /><Skeleton className="h-4 w-10" /></div>
            <Skeleton className="h-7 w-20" /><Skeleton className="h-3 w-24" />
          </CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/40"><CardContent className="p-5 space-y-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-7 w-16" /><Skeleton className="h-3 w-20" />
          </CardContent></Card>
        ))}
      </div>
      <Card className="border-border/40"><CardContent className="p-6"><Skeleton className="h-75 w-full rounded-xl" /></CardContent></Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminDashboardClient() {
  const [stats,        setStats]        = useState<DashboardStats | null>(null);
  const [loadedPeriod, setLoadedPeriod] = useState<Period | null>(null);
  const [period,       setPeriod]       = useState<Period>("30days");

  // loading is derived — no synchronous setState inside the effect
  const loading = period !== loadedPeriod;

  useEffect(() => {
    let cancelled = false;

    api.get<ApiResponse<DashboardStats>>(`/admin/dashboard?period=${period}`)
      .then((res) => {
        if (cancelled) return;
        if (res.data) setStats(res.data);
        setLoadedPeriod(period);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Failed to load dashboard data.");
        setLoadedPeriod(period); // stop spinner even on error
      });

    return () => { cancelled = true; };
  }, [period]);

  const s = stats?.stats;

  const trends = useMemo(() => ({
    users: s ? calcTrend(s.newUsers, s.prevUsers) : null,
    reviews: s ? calcTrend(s.newReviews, s.prevReviews) : null,
    subs: s ? calcTrend(s.newSubscriptions, s.prevSubscriptions) : null,
  }), [s]);

  if (loading) return <DashboardSkeleton />;
  if (!stats || !s) return null;

  const periodLabel = formatPeriodLabel(period);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">System Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time analytics and platform performance metrics.
          </p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList className="h-10">
            {PERIODS.map(({ value, label }) => (
              <TabsTrigger key={value} value={value} className="px-4 text-xs font-semibold">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* ── Period stat cards (new in selected period) ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
          <FiCalendar className="w-3.5 h-3.5" /> New activity — {periodLabel}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="New Users"
            value={s.newUsers.toLocaleString()}
            icon={FiUsers}
            iconColor="text-blue-500"
            iconBg="bg-blue-500/10"
            sub={`${s.totalUsers.toLocaleString()} total`}
            trend={trends.users}
          />
          <StatCard
            title="New Reviews"
            value={s.newReviews.toLocaleString()}
            icon={FiMessageSquare}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-500/10"
            sub={`${s.pendingReviews} pending approval`}
            trend={trends.reviews}
          />
          <StatCard
            title="New Subscriptions"
            value={s.newSubscriptions.toLocaleString()}
            icon={MdSubscriptions}
            iconColor="text-violet-500"
            iconBg="bg-violet-500/10"
            sub={`${s.activeSubscriptions} total active`}
            trend={trends.subs}
          />
          <StatCard
            title="Est. MRR"
            value={`$${s.estimatedMRR.toFixed(0)}`}
            icon={FiDollarSign}
            iconColor="text-primary"
            iconBg="bg-primary/10"
            sub={`ARR $${s.estimatedARR.toFixed(0)}`}
          />
        </div>
      </div>

      {/* ── All-time stat cards ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
          <FiActivity className="w-3.5 h-3.5" /> Platform totals — all time
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Users"     value={s.totalUsers.toLocaleString()}   icon={FiUsers}        iconColor="text-blue-400"   iconBg="bg-blue-400/10"   />
          <StatCard title="Total Media"     value={s.totalMedia.toLocaleString()}   icon={FiStar}         iconColor="text-amber-400"  iconBg="bg-amber-400/10"  />
          <StatCard title="Total Reviews"   value={s.totalReviews.toLocaleString()} icon={FiMessageSquare} iconColor="text-green-400"  iconBg="bg-green-400/10"  />
          <StatCard title="Pending Reviews" value={s.pendingReviews.toLocaleString()} icon={FiClock}      iconColor="text-orange-400" iconBg="bg-orange-400/10" />
        </div>
      </div>

      {/* ── Area Chart ── */}
      <Card className="border-border/40 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/5 border-b py-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FiTrendingUp className="text-primary" /> Activity Overview
          </CardTitle>
          <CardDescription className="text-[10px] uppercase font-black tracking-widest opacity-60">
            Users · Reviews · Subscriptions — {periodLabel}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 px-2 pb-4">
          <ChartContainer config={CHART_CONFIG} className="h-75 w-full">
            <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--color-users)"         stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-users)"         stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="fillReviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--color-reviews)"       stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-reviews)"       stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="fillSubscriptions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--color-subscriptions)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-subscriptions)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" opacity={0.4} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickMargin={8}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                allowDecimals={false}
                width={30}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area dataKey="users"         type="monotone" stroke="var(--color-users)"         fill="url(#fillUsers)"         strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Area dataKey="reviews"       type="monotone" stroke="var(--color-reviews)"       fill="url(#fillReviews)"       strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Area dataKey="subscriptions" type="monotone" stroke="var(--color-subscriptions)" fill="url(#fillSubscriptions)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ── Recent Reviews + Segment Pie ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Reviews Table */}
        <Card className="lg:col-span-2 border-border/40 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/5 border-b py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FiMessageSquare className="text-primary" /> Recent Reviews
            </CardTitle>
            <a href="/admin/reviews" className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline">
              View All <FiArrowRight className="w-3 h-3" />
            </a>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="text-left text-[10px] font-black uppercase tracking-wider px-5 py-3 text-muted-foreground">User</th>
                    <th className="text-left text-[10px] font-black uppercase tracking-wider px-4 py-3 text-muted-foreground hidden sm:table-cell">Media</th>
                    <th className="text-left text-[10px] font-black uppercase tracking-wider px-4 py-3 text-muted-foreground">Rating</th>
                    <th className="text-left text-[10px] font-black uppercase tracking-wider px-4 py-3 text-muted-foreground">Status</th>
                    <th className="text-right text-[10px] font-black uppercase tracking-wider px-5 py-3 text-muted-foreground hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {stats.recentReviews.map((review) => {
                    const ss = STATUS_STYLE[review.status] ?? STATUS_STYLE.PENDING;
                    return (
                      <tr key={review.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7 shrink-0">
                              <AvatarImage src={review.user.image ?? undefined} />
                              <AvatarFallback className="text-[10px] font-bold">{review.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{review.user.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate max-w-25">{review.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <span className="text-xs font-semibold truncate block max-w-32.5">{review.media?.title ?? "N/A"}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <FiStar className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                            <span className="text-xs font-black">{review.rating}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant="outline" className={cn("text-[9px] font-bold px-1.5 py-0.5", ss.color)}>
                            {ss.label}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right hidden md:table-cell">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Segment Pie Chart */}
        <SegmentPieChart stats={stats} />
      </div>
    </div>
  );
}
