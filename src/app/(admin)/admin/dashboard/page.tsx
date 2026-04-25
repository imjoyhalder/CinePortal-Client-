import type { Metadata } from "next";
import { FiUsers, FiFilm, FiMessageSquare, FiClock, FiDollarSign, FiStar } from "react-icons/fi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ApiResponse, DashboardStats } from "@/types";

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

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { label: "Total Users", value: stats?.stats.totalUsers ?? 0, icon: FiUsers, color: "text-blue-400" },
    { label: "Total Media", value: stats?.stats.totalMedia ?? 0, icon: FiFilm, color: "text-purple-400" },
    { label: "Total Reviews", value: stats?.stats.totalReviews ?? 0, icon: FiMessageSquare, color: "text-green-400" },
    { label: "Pending Reviews", value: stats?.stats.pendingReviews ?? 0, icon: FiClock, color: "text-amber-400" },
    { label: "Active Subscriptions", value: stats?.stats.activeSubscriptions ?? 0, icon: FiDollarSign, color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform overview and recent activity</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border/50">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent reviews */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Recent Reviews</h2>
              <a href="/admin/reviews" className="text-xs text-primary hover:underline">View all</a>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.recentReviews.length ? (
              stats.recentReviews.map((review) => (
                <div key={review.id} className="flex items-start justify-between gap-3 py-2 border-b border-border/30 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{review.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{review.media?.title}</p>
                    <p className="text-xs text-foreground/70 line-clamp-1 mt-0.5">{review.content}</p>
                  </div>
                  <Badge
                    variant={review.status === "APPROVED" ? "default" : review.status === "PENDING" ? "secondary" : "destructive"}
                    className="text-xs shrink-0"
                  >
                    {review.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No reviews yet</p>
            )}
          </CardContent>
        </Card>

        {/* Top rated media */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Top Rated Media</h2>
              <a href="/admin/movies" className="text-xs text-primary hover:underline">View all</a>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.topRatedMedia.length ? (
              stats.topRatedMedia.map((media, i) => (
                <div key={media.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                  <span className="text-sm font-bold text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{media.title}</p>
                    <p className="text-xs text-muted-foreground">{media._count.reviews} reviews</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <FiStar className="w-3 h-3 text-primary" />
                    <span className="text-sm font-bold">{media.averageRating.toFixed(1)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No media yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
