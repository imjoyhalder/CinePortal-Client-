"use client";

import Image from "next/image";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie,
} from "recharts";
import { FiStar, FiArrowRight } from "react-icons/fi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { DashboardStats, ReviewStatus } from "@/types";

// ── helpers ────────────────────────────────────────────────────────────────

function buildLineChartData(totalUsers: number, totalReviews: number, activeSubs: number) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const label  = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const factor = (i + 1) / 7;
    return {
      date:          label,
      Users:         Math.round(totalUsers  * (0.60 + 0.40 * factor)),
      Reviews:       Math.round(totalReviews * (0.55 + 0.45 * factor)),
      Subscriptions: Math.round(activeSubs   * (0.65 + 0.35 * factor)),
    };
  });
}

function statusBadgeClass(status: ReviewStatus): string {
  if (status === "APPROVED")   return "bg-green-500/15 text-green-400 border-green-500/20";
  if (status === "PENDING")    return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  return "bg-red-500/15 text-red-400 border-red-500/20";
}

const TOOLTIP_STYLE = {
  background:   "hsl(var(--popover))",
  border:       "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize:     12,
};

// ── component ──────────────────────────────────────────────────────────────

type TopRatedMedia = DashboardStats["topRatedMedia"][number];
type RecentReview  = DashboardStats["recentReviews"][number];

interface Props { stats: DashboardStats }

export function DashboardCharts({ stats }: Props) {
  const { totalUsers, totalReviews, activeSubscriptions, monthlySubscriptions, yearlySubscriptions } = stats.stats;

  const lineData = buildLineChartData(totalUsers, totalReviews, activeSubscriptions);

  // Real plan breakdown from API
  const freeCount = Math.max(0, totalUsers - activeSubscriptions);
  const pieData = [
    { name: "Monthly Pro",     value: monthlySubscriptions, color: "#22c55e" },
    { name: "Annual Premium",  value: yearlySubscriptions,  color: "#a855f7" },
    { name: "Free",            value: freeCount,            color: "#64748b" },
  ].filter((d) => d.value > 0);

  const totalPie = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">

      {/* ── Row 1: line chart + top-rated + pie ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Line chart */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Platform Overview</h2>
              <span className="text-xs text-muted-foreground">Last 7 days (projected)</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "hsl(var(--foreground))" }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" iconSize={8} />
                <Line type="monotone" dataKey="Users"         stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="Reviews"       stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="Subscriptions" stroke="#a855f7" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Right column: top-rated + pie stacked */}
        <div className="space-y-6">

          {/* Top rated media */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm">Top Rated Media</h2>
                <Link href="/admin/movies" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                  View all <FiArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 px-4 pb-4">
              {stats.topRatedMedia.length ? (
                stats.topRatedMedia.slice(0, 5).map((media: TopRatedMedia, i) => (
                  <div key={media.id} className="flex items-center gap-2.5 py-1.5 border-b border-border/20 last:border-0">
                    <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">#{i + 1}</span>
                    {media.posterUrl ? (
                      <div className="relative w-8 h-11 shrink-0 rounded overflow-hidden">
                        <Image src={media.posterUrl} alt={media.title} fill className="object-cover" sizes="32px" />
                      </div>
                    ) : (
                      <div className="w-8 h-11 shrink-0 rounded bg-muted flex items-center justify-center">
                        <FiStar className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{media.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <FiStar className="w-2.5 h-2.5 text-amber-400" />
                        <span className="text-xs font-semibold text-amber-400">
                          {media.averageRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">/ 10</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-2">No media yet</p>
              )}
            </CardContent>
          </Card>

          {/* Subscription breakdown pie */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <h2 className="font-semibold text-sm">Subscribers by Plan</h2>
            </CardHeader>
            <CardContent className="pb-4">
              {totalPie > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={pieData.map((d) => ({ ...d, fill: d.color }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-1">
                    {pieData.map((entry) => (
                      <div key={entry.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
                          <span className="text-muted-foreground">{entry.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">{entry.value.toLocaleString()}</span>
                          <span className="text-muted-foreground">
                            {totalPie > 0 ? `${Math.round((entry.value / totalPie) * 100)}%` : "0%"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">No subscription data yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Row 2: Recent reviews table ─────────────────────────────────── */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent Reviews</h2>
            <Link href="/admin/reviews" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              View all <FiArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {stats.recentReviews.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    <th className="text-left text-xs text-muted-foreground font-medium px-5 py-3">User</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-3">Media</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-3">Rating</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-3 hidden md:table-cell">Review</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-3">Status</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-3 pr-5 hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentReviews.map((review: RecentReview) => (
                    <tr key={review.id} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-7 h-7 shrink-0">
                            <AvatarImage src={review.user.image ?? undefined} alt={review.user.name} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {review.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{review.user.name}</p>
                            <p className="text-xs text-muted-foreground truncate hidden sm:block">{review.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          {review.media?.posterUrl && (
                            <div className="relative w-6 h-9 shrink-0 rounded overflow-hidden">
                              <Image src={review.media.posterUrl} alt={review.media.title ?? ""} fill className="object-cover" sizes="24px" />
                            </div>
                          )}
                          <span className="text-xs truncate max-w-22.5">{review.media?.title ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <FiStar className="w-3 h-3 text-amber-400" />
                          <span className="text-xs font-semibold">{review.rating}</span>
                          <span className="text-xs text-muted-foreground">/10</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell max-w-45">
                        <p className="text-xs text-muted-foreground truncate">{review.content}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(review.status)}`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 pr-5 hidden sm:table-cell whitespace-nowrap">
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground px-5 py-6">No reviews yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
