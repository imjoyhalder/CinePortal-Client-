"use client";

import { useEffect, useState } from "react";
import {
  FiUsers, FiFilm, FiMessageSquare, FiClock,
  FiDollarSign, FiCalendar, FiLoader,
} from "react-icons/fi";
import { MdSubscriptions } from "react-icons/md";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { ApiResponse, DashboardStats } from "@/types";
import { DashboardCharts } from "./dashboard-charts";

// ── helpers ────────────────────────────────────────────────────────────────

function formatDateRange() {
  const end   = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(start).replace(/,\s*\d{4}$/, "")} – ${fmt(end)}`;
}

const STAT_CARDS = [
  {
    key:       "totalUsers"          as const,
    label:     "Total Users",
    icon:      FiUsers,
    iconColor: "text-blue-400",
    iconBg:    "bg-blue-400/10",
  },
  {
    key:       "totalMedia"          as const,
    label:     "Total Media",
    icon:      FiFilm,
    iconColor: "text-purple-400",
    iconBg:    "bg-purple-400/10",
  },
  {
    key:       "totalReviews"        as const,
    label:     "Total Reviews",
    icon:      FiMessageSquare,
    iconColor: "text-green-400",
    iconBg:    "bg-green-400/10",
  },
  {
    key:       "pendingReviews"      as const,
    label:     "Pending Reviews",
    icon:      FiClock,
    iconColor: "text-amber-400",
    iconBg:    "bg-amber-400/10",
  },
  {
    key:       "activeSubscriptions" as const,
    label:     "Active Subscriptions",
    icon:      MdSubscriptions,
    iconColor: "text-emerald-400",
    iconBg:    "bg-emerald-400/10",
  },
] as const;

// ── component ──────────────────────────────────────────────────────────────

export default function AdminDashboardClient() {
  const [stats,   setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ApiResponse<DashboardStats>>("/admin/dashboard")
      .then((r) => setStats(r.data ?? null))
      .catch(() => { toast.error("Failed to load dashboard stats"); })
      .finally(() => setLoading(false));
  }, []);

  /* ── skeleton ─────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-7 w-40 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-9 w-44 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-card border border-border/50 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="flex items-center justify-center h-64">
          <FiLoader className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const s = stats?.stats;

  /* ── main ─────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back! Here&apos;s what&apos;s happening with your platform.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 border border-border/40 rounded-lg px-3 py-2 shrink-0">
          <FiCalendar className="w-4 h-4 text-primary shrink-0" />
          <span>{formatDateRange()}</span>
        </div>
      </div>

      {/* Stat cards — 6 across: 5 count cards + 1 revenue card */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, iconColor, iconBg }) => (
          <Card key={key} className="border-border/50">
            <CardContent className="pt-4 pb-3">
              <div className={`inline-flex p-2 rounded-lg ${iconBg} mb-3`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <p className="text-2xl font-bold leading-none">
                {(s?.[key] ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}

        {/* Revenue card */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-3">
            <div className="inline-flex p-2 rounded-lg bg-primary/15 mb-3">
              <FiDollarSign className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold leading-none text-primary">
              ${(s?.estimatedMRR ?? 0).toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Est. Monthly Revenue</p>
            {s && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {s.monthlySubscriptions}mo · {s.yearlySubscriptions}yr
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts + tables */}
      {stats && <DashboardCharts stats={stats} />}
    </div>
  );
}
