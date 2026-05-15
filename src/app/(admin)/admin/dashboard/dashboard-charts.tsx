"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, TooltipProps
} from "recharts";
import { FiStar, FiArrowRight, FiActivity, FiUsers, FiMessageSquare } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardStats, ReviewStatus } from "@/types";

// --- Derived Types ---

type RecentReview = DashboardStats["recentReviews"][number];

// --- Typed Configuration & Interfaces ---

interface ChartDataItem {
  date: string;
  Users: number;
  Reviews: number;
  Subscriptions: number;
}

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

interface StatusStyle {
  color: string;
  label: string;
}

const COLORS = {
  users: "#3b82f6",
  reviews: "#22c55e",
  subs: "#a855f7",
  monthly: "#22c55e",
  yearly: "#a855f7",
  free: "#64748b",
};

// --- Strict Helper Functions ---

const getStatusConfig = (status: ReviewStatus): StatusStyle => {
  const configs: Record<ReviewStatus, StatusStyle> = {
    APPROVED: { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", label: "Approved" },
    PENDING: { color: "text-amber-500 bg-amber-500/10 border-amber-500/20", label: "Pending" },
    UNPUBLISHED: { color: "text-destructive bg-destructive/10 border-destructive/20", label: "Unpublished" },
  };
  return configs[status] || configs.PENDING;
};


const generateLineData = (stats: DashboardStats["stats"]): ChartDataItem[] => {
  const { totalUsers, totalReviews, activeSubscriptions } = stats;
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const factor = (i + 1) / 7;
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      Users: Math.round(totalUsers * (0.6 + 0.4 * factor)),
      Reviews: Math.round(totalReviews * (0.55 + 0.45 * factor)),
      Subscriptions: Math.round(activeSubscriptions * (0.65 + 0.35 * factor)),
    };
  });
};

// --- Strongly Typed Custom Tooltip ---

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded-lg shadow-xl text-[11px]">
        <p className="font-bold mb-2 text-foreground">{label}</p>
        {payload.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-3 mb-1" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground font-medium">{entry.name}:</span>
            <span className="font-mono font-bold ml-auto text-foreground">{entry.value?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- Main Component ---

export function DashboardCharts({ stats }: { stats: DashboardStats }) {
  const { totalUsers, activeSubscriptions, monthlySubscriptions, yearlySubscriptions } = stats.stats;

  const lineData = useMemo(() => generateLineData(stats.stats), [stats.stats]);

  const pieData = useMemo<PieDataItem[]>(() => {
    const freeCount = Math.max(0, totalUsers - activeSubscriptions);
    return [
      { name: "Monthly Pro", value: monthlySubscriptions, color: COLORS.monthly },
      { name: "Annual Elite", value: yearlySubscriptions, color: COLORS.yearly },
      { name: "Free Tier", value: freeCount, color: COLORS.free },
    ].filter(d => d.value > 0);
  }, [totalUsers, activeSubscriptions, monthlySubscriptions, yearlySubscriptions]);

  const totalPieValue = useMemo(() => pieData.reduce((acc, curr) => acc + curr.value, 0), [pieData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* Platform Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/40 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/5 py-4 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FiActivity className="text-primary" /> Platform Insights
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-black tracking-widest opacity-70">
              Active Users vs Content Engagement
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "gray" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "gray" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, paddingBottom: 15 }} />
                  <Line type="monotone" dataKey="Users" stroke={COLORS.users} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Reviews" stroke={COLORS.reviews} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Subscriptions" stroke={COLORS.subs} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart Card */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-muted/5 py-4 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FiUsers className="text-primary" /> Segment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="py-6">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] font-bold text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold">
                    {((item.value / totalPieValue) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews Table */}
      <Card className="border-border/40 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b bg-muted/5">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FiMessageSquare className="text-primary" /> Activity Log
          </CardTitle>
          <Button variant="outline" size="sm" asChild className="h-7 text-[10px] font-bold">
            <Link href="/admin/reviews">Management Suite</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/20 border-b">
                  <th className="text-left text-[10px] font-black uppercase px-6 py-3 text-muted-foreground">User</th>
                  <th className="text-left text-[10px] font-black uppercase px-4 py-3 text-muted-foreground">Media</th>
                  <th className="text-left text-[10px] font-black uppercase px-4 py-3 text-muted-foreground">Sentiment</th>
                  <th className="text-left text-[10px] font-black uppercase px-4 py-3 text-muted-foreground">Status</th>
                  <th className="text-right text-[10px] font-black uppercase px-6 py-3 text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {stats.recentReviews.slice(0, 5).map((review: RecentReview) => {
                  const statusStyle = getStatusConfig(review.status);
                  return (
                    <tr key={review.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={review.user.image ?? undefined} />
                            <AvatarFallback className="text-[10px] font-bold">
                              {review.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">{review.user.name}</span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{review.user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-semibold truncate block max-w-[150px]">
                          {review.media?.title || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <FiStar className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-black">{review.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={cn("text-[9px] font-bold px-2", statusStyle.color)}>
                          {statusStyle.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
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
    </div>
  );
}