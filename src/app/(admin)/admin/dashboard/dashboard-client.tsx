// "use client";

// import { useEffect, useState } from "react";
// import {
//   FiUsers, FiFilm, FiMessageSquare, FiClock,
//   FiDollarSign, FiTrendingUp, FiCalendar, FiLoader,
// } from "react-icons/fi";
// import { MdSubscriptions } from "react-icons/md";
// import { Card, CardContent } from "@/components/ui/card";
// import { api } from "@/lib/api";
// import { toast } from "sonner";
// import type { ApiResponse, DashboardStats } from "@/types";
// import { DashboardCharts } from "./dashboard-charts";

// // ── helpers ────────────────────────────────────────────────────────────────

// function formatDateRange() {
//   const end   = new Date();
//   const start = new Date();
//   start.setDate(end.getDate() - 6);
//   const fmt = (d: Date) =>
//     d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
//   return `${fmt(start).replace(/,\s*\d{4}$/, "")} – ${fmt(end)}`;
// }

// const STAT_CARDS = [
//   {
//     key:       "totalUsers"          as const,
//     label:     "Total Users",
//     icon:      FiUsers,
//     iconColor: "text-blue-400",
//     iconBg:    "bg-blue-400/10",
//   },
//   {
//     key:       "totalMedia"          as const,
//     label:     "Total Media",
//     icon:      FiFilm,
//     iconColor: "text-purple-400",
//     iconBg:    "bg-purple-400/10",
//   },
//   {
//     key:       "totalReviews"        as const,
//     label:     "Total Reviews",
//     icon:      FiMessageSquare,
//     iconColor: "text-green-400",
//     iconBg:    "bg-green-400/10",
//   },
//   {
//     key:       "pendingReviews"      as const,
//     label:     "Pending Reviews",
//     icon:      FiClock,
//     iconColor: "text-amber-400",
//     iconBg:    "bg-amber-400/10",
//   },
//   {
//     key:       "activeSubscriptions" as const,
//     label:     "Active Subscriptions",
//     icon:      MdSubscriptions,
//     iconColor: "text-emerald-400",
//     iconBg:    "bg-emerald-400/10",
//   },
// ] as const;

// // ── component ──────────────────────────────────────────────────────────────

// export default function AdminDashboardClient() {
//   const [stats,   setStats]   = useState<DashboardStats | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     api.get<ApiResponse<DashboardStats>>("/admin/dashboard")
//       .then((r) => setStats(r.data ?? null))
//       .catch(() => { toast.error("Failed to load dashboard stats"); })
//       .finally(() => setLoading(false));
//   }, []);

//   /* ── skeleton ─────────────────────────────────────────────────────────── */
//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div className="space-y-1.5">
//             <div className="h-7 w-40 bg-muted rounded animate-pulse" />
//             <div className="h-4 w-64 bg-muted rounded animate-pulse" />
//           </div>
//           <div className="h-9 w-44 bg-muted rounded-lg animate-pulse" />
//         </div>
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
//           {Array.from({ length: 7 }).map((_, i) => (
//             <div key={i} className="h-28 bg-card border border-border/50 rounded-xl animate-pulse" />
//           ))}
//         </div>
//         <div className="flex items-center justify-center h-64">
//           <FiLoader className="w-6 h-6 animate-spin text-muted-foreground" />
//         </div>
//       </div>
//     );
//   }

//   const s = stats?.stats;

//   /* ── main ─────────────────────────────────────────────────────────────── */
//   return (
//     <div className="space-y-6">

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//         <div>
//           <h1 className="text-2xl font-bold">Dashboard</h1>
//           <p className="text-sm text-muted-foreground mt-0.5">
//             Welcome back! Here&apos;s what&apos;s happening with your platform.
//           </p>
//         </div>
//         <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 border border-border/40 rounded-lg px-3 py-2 shrink-0">
//           <FiCalendar className="w-4 h-4 text-primary shrink-0" />
//           <span>{formatDateRange()}</span>
//         </div>
//       </div>

//       {/* Stat cards — 5 count cards + 2 revenue cards */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
//         {STAT_CARDS.map(({ key, label, icon: Icon, iconColor, iconBg }) => (
//           <Card key={key} className="border-border/50">
//             <CardContent className="pt-4 pb-3">
//               <div className={`inline-flex p-2 rounded-lg ${iconBg} mb-3`}>
//                 <Icon className={`w-4 h-4 ${iconColor}`} />
//               </div>
//               <p className="text-2xl font-bold leading-none">
//                 {(s?.[key] ?? 0).toLocaleString()}
//               </p>
//               <p className="text-xs text-muted-foreground mt-1">{label}</p>
//             </CardContent>
//           </Card>
//         ))}

//         {/* MRR card */}
//         <Card className="border-primary/30 bg-primary/5">
//           <CardContent className="pt-4 pb-3">
//             <div className="inline-flex p-2 rounded-lg bg-primary/15 mb-3">
//               <FiDollarSign className="w-4 h-4 text-primary" />
//             </div>
//             <p className="text-2xl font-bold leading-none text-primary">
//               ${(s?.estimatedMRR ?? 0).toFixed(0)}
//             </p>
//             <p className="text-xs text-muted-foreground mt-1">Est. MRR</p>
//             {s && (
//               <p className="text-xs text-muted-foreground mt-0.5">
//                 {s.monthlySubscriptions}mo · {s.yearlySubscriptions}yr
//               </p>
//             )}
//           </CardContent>
//         </Card>

//         {/* ARR card */}
//         <Card className="border-emerald-500/30 bg-emerald-500/5">
//           <CardContent className="pt-4 pb-3">
//             <div className="inline-flex p-2 rounded-lg bg-emerald-500/15 mb-3">
//               <FiTrendingUp className="w-4 h-4 text-emerald-500" />
//             </div>
//             <p className="text-2xl font-bold leading-none text-emerald-500">
//               ${(s?.estimatedARR ?? 0).toFixed(0)}
//             </p>
//             <p className="text-xs text-muted-foreground mt-1">Est. ARR</p>
//             <p className="text-xs text-muted-foreground mt-0.5">Annual revenue</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Charts + tables */}
//       {stats && <DashboardCharts stats={stats} />}
//     </div>
//   );
// }


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