import type { Metadata } from "next";
import {
  FiUsers,
  FiFilm,
  FiMessageSquare,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
} from "react-icons/fi";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiResponse, DashboardStats } from "@/types";
import { DashboardCharts } from "./dashboard-charts";

export const metadata: Metadata = { title: "Admin Dashboard" };

async function getStats(): Promise<DashboardStats | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/dashboard`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data: ApiResponse<DashboardStats> = await res.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}

function formatDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(start).replace(/,\s*\d{4}$/, "")} – ${fmt(end)}`;
}

const statCards = [
  {
    key: "totalUsers" as const,
    label: "Total Users",
    icon: FiUsers,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-400/10",
    trend: "+12.5%",
    positive: true,
  },
  {
    key: "totalMedia" as const,
    label: "Total Media",
    icon: FiFilm,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-400/10",
    trend: "+8.4%",
    positive: true,
  },
  {
    key: "totalReviews" as const,
    label: "Total Reviews",
    icon: FiMessageSquare,
    iconColor: "text-green-400",
    iconBg: "bg-green-400/10",
    trend: "+15.3%",
    positive: true,
  },
  {
    key: "pendingReviews" as const,
    label: "Pending Reviews",
    icon: FiClock,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-400/10",
    trend: "-11.1%",
    positive: false,
  },
  {
    key: "activeSubscriptions" as const,
    label: "Active Subscriptions",
    icon: FiDollarSign,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-400/10",
    trend: "+9.7%",
    positive: true,
  },
] as const;

const emptyStats: DashboardStats = {
  stats: {
    totalUsers: 0,
    totalMedia: 0,
    totalReviews: 0,
    pendingReviews: 0,
    activeSubscriptions: 0,
  },
  recentReviews: [],
  topRatedMedia: [],
};

export default async function AdminDashboard() {
  const stats = (await getStats()) ?? emptyStats;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your platform.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 border border-border/40 rounded-lg px-3 py-2 shrink-0">
          <FiCalendar className="w-4 h-4 text-primary shrink-0" />
          <span>{formatDateRange()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(({ key, label, icon: Icon, iconColor, iconBg, trend, positive }) => (
          <Card key={key} className="border-border/50">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${iconBg}`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    positive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {positive ? (
                    <FiTrendingUp className="w-3 h-3" />
                  ) : (
                    <FiTrendingDown className="w-3 h-3" />
                  )}
                  {trend}
                </div>
              </div>
              <p className="text-2xl font-bold leading-none">
                {stats.stats[key].toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <DashboardCharts stats={stats} />
    </div>
  );
}
