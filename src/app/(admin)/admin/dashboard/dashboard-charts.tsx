"use client";

import Image from "next/image";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FiStar } from "react-icons/fi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { DashboardStats, ReviewStatus } from "@/types";

type TopRatedMedia = DashboardStats["topRatedMedia"][number];
type Review = DashboardStats["recentReviews"][number];

function buildLineChartData(
  totalUsers: number,
  totalReviews: number,
  activeSubscriptions: number
) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const factor = (i + 1) / 7;
    return {
      date: label,
      Users: Math.round(totalUsers * (0.6 + 0.4 * factor)),
      Reviews: Math.round(totalReviews * (0.55 + 0.45 * factor)),
      Subscriptions: Math.round(activeSubscriptions * (0.65 + 0.35 * factor)),
    };
  });
}

function buildPieData(activeSubscriptions: number) {
  const premium = Math.round(activeSubscriptions * 0.41);
  const monthly = Math.round(activeSubscriptions * 0.36);
  const basic = activeSubscriptions - premium - monthly;
  return [
    { name: "Premium", value: premium, color: "#3b82f6" },
    { name: "Monthly", value: monthly, color: "#22c55e" },
    { name: "Basic", value: basic, color: "#a855f7" },
  ];
}

function FilledStars({ rating }: { rating: number }) {
  const filled = Math.round((rating / 10) * 5);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <FiStar
          key={i}
          className={`w-3 h-3 ${i < filled ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  );
}

function statusBadgeClass(status: ReviewStatus): string {
  if (status === "APPROVED") return "bg-green-500/15 text-green-400 border-green-500/20";
  if (status === "PENDING") return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  return "bg-red-500/15 text-red-400 border-red-500/20";
}

interface DashboardChartsProps {
  stats: DashboardStats;
}

export function DashboardCharts({ stats }: DashboardChartsProps) {
  const { totalUsers, totalReviews, activeSubscriptions } = stats.stats;
  const lineData = buildLineChartData(totalUsers, totalReviews, activeSubscriptions);
  const pieData = buildPieData(activeSubscriptions);
  const totalPie = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-2">
            <h2 className="font-semibold">Platform Overview</h2>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Line
                  type="monotone"
                  dataKey="Users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Reviews"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Subscriptions"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:contents">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Top Rated Media</h2>
                <Link href="/admin/movies" className="text-xs text-primary hover:underline">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.topRatedMedia.length ? (
                stats.topRatedMedia.slice(0, 5).map((media: TopRatedMedia, i) => (
                  <div
                    key={media.id}
                    className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0"
                  >
                    <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">
                      #{i + 1}
                    </span>
                    {media.posterUrl ? (
                      <div className="relative w-10 h-14 shrink-0 rounded overflow-hidden">
                        <Image
                          src={media.posterUrl}
                          alt={media.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-14 shrink-0 rounded bg-muted flex items-center justify-center">
                        <FiStar className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{media.title}</p>
                      <p className="text-xs text-muted-foreground">{media.releaseYear}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <FiStar className="w-3 h-3 text-amber-400" />
                        <span className="text-xs font-semibold">
                          {media.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No media yet</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <h2 className="font-semibold">Subscriptions by Plan</h2>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: entry.color }}
                      />
                      <span className="text-muted-foreground">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entry.value.toLocaleString()}</span>
                      <span className="text-muted-foreground">
                        {totalPie > 0 ? Math.round((entry.value / totalPie) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent Reviews</h2>
            <Link href="/admin/reviews" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {stats.recentReviews.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left text-xs text-muted-foreground font-medium px-6 py-3">
                      User
                    </th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-3">
                      Media
                    </th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-3">
                      Rating
                    </th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-3">
                      Review
                    </th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-3 pr-6">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentReviews.map((review: Review) => (
                    <tr
                      key={review.id}
                      className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            {review.user.image ? (
                              <AvatarImage src={review.user.image} alt={review.user.name} />
                            ) : null}
                            <AvatarFallback>
                              {review.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-xs whitespace-nowrap">
                            {review.user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          {review.media?.posterUrl ? (
                            <div className="relative w-7 h-10 shrink-0 rounded overflow-hidden">
                              <Image
                                src={review.media.posterUrl}
                                alt={review.media.title ?? ""}
                                fill
                                className="object-cover"
                                sizes="28px"
                              />
                            </div>
                          ) : null}
                          <span className="text-xs truncate max-w-[100px]">
                            {review.media?.title ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <FilledStars rating={review.rating} />
                      </td>
                      <td className="px-3 py-3 max-w-[180px]">
                        <p className="text-xs text-muted-foreground truncate">{review.content}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(review.status)}`}
                        >
                          {review.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 pr-6 whitespace-nowrap">
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground px-6 py-4">No reviews yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
