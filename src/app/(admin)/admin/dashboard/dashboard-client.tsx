"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  FiUsers, FiFilm, FiMessageSquare, FiClock,
  FiDollarSign, FiTrendingUp, FiCalendar, FiLoader,
} from "react-icons/fi";
import { MdSubscriptions } from "react-icons/md";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { ApiResponse, DashboardStats } from "@/types";
import { DashboardCharts } from "./dashboard-charts";
import { cn } from "@/lib/utils";

// --- Types & Constants ---

type StatKey = keyof DashboardStats["stats"];

interface StatCardConfig {
  key: StatKey;
  label: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const STAT_CARDS_CONFIG: StatCardConfig[] = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: FiUsers,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
  },
  {
    key: "totalMedia",
    label: "Total Media",
    icon: FiFilm,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
  },
  {
    key: "totalReviews",
    label: "Total Reviews",
    icon: FiMessageSquare,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
  {
    key: "pendingReviews",
    label: "Pending Review",
    icon: FiClock,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
  },
  {
    key: "activeSubscriptions",
    label: "Active Subs",
    icon: MdSubscriptions,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/10",
  },
];

// --- Helpers ---

const getFormattedDateRange = (): string => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = start.toLocaleDateString("en-US", options);
  const endStr = end.toLocaleDateString("en-US", { ...options, year: "numeric" });
  
  return `${startStr} – ${endStr}`;
};

// --- Sub-Components ---

const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-[400px] w-full rounded-xl" />
  </div>
);

// --- Main Component ---

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const response = await api.get<ApiResponse<DashboardStats>>("/admin/dashboard");
        if (isMounted && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        toast.error("Critical: Could not synchronize dashboard data.");
        console.error("[DASHBOARD_ERROR]", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStats();
    return () => { isMounted = false; };
  }, []);

  const dateRange = useMemo(() => getFormattedDateRange(), []);

  if (isLoading) return <DashboardSkeleton />;

  const s = stats?.stats;

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">System Overview</h1>
          <p className="text-muted-foreground text-sm font-medium">
            Real-time analytics and platform performance metrics.
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-border/50 rounded-full w-fit">
          <FiCalendar className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {dateRange}
          </span>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {STAT_CARDS_CONFIG.map((card) => (
          <Card key={card.key} className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className={cn("p-2 rounded-lg mb-4", card.iconBg)}>
                <card.icon className={cn("w-4 h-4", card.iconColor)} />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black tracking-tighter font-mono">
                  {s?.[card.key]?.toLocaleString() ?? "0"}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {card.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Financial Metrics - MRR */}
        <Card className="border-primary/20 bg-primary/[0.02] shadow-sm">
          <CardContent className="p-5">
            <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
              <FiDollarSign className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black tracking-tighter font-mono text-primary">
                ${s?.estimatedMRR?.toLocaleString() ?? "0"}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                Monthly Revenue
              </p>
              <div className="flex gap-2 pt-1">
                <span className="text-[9px] font-bold text-muted-foreground">
                  M: {s?.monthlySubscriptions ?? 0}
                </span>
                <span className="text-[9px] font-bold text-muted-foreground">
                  Y: {s?.yearlySubscriptions ?? 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Metrics - ARR */}
        <Card className="border-emerald-500/20 bg-emerald-500/[0.02] shadow-sm">
          <CardContent className="p-5">
            <div className="p-2 rounded-lg bg-emerald-500/10 w-fit mb-4">
              <FiTrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black tracking-tighter font-mono text-emerald-600">
                ${s?.estimatedARR?.toLocaleString() ?? "0"}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/80">
                Annual Run Rate
              </p>
              <p className="text-[9px] font-bold text-muted-foreground pt-1 italic">
                Projected Yearly
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualizations Section */}
      {stats && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <DashboardCharts stats={stats} />
        </div>
      )}
    </div>
  );
}