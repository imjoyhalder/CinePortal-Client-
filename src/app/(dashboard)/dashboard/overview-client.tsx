"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiMessageSquare, FiBookmark, FiStar, FiCreditCard,
  FiArrowRight, FiCheck, FiShield, FiTrendingUp, FiClock
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ApiResponse, User, Review, UserDashboardStats, WatchlistItem } from "@/types";

// --- Types & Interfaces ---

interface PlanStyle {
  label: string;
  color: string;
}

const PLAN_CONFIG: Record<string, PlanStyle> = {
  FREE: { label: "Free Plan", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  MONTHLY: { label: "Pro Monthly", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  YEARLY: { label: "Annual Elite", color: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  ADMIN: { label: "System Admin", color: "bg-primary/10 text-primary border-primary/20" },
};

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  footer: string;
  footerColor?: string;
  highlight?: boolean;
}

interface DashboardData {
  profile: User | null;
  stats: UserDashboardStats | null;
  reviews: Review[];
  watchlist: WatchlistItem[];
}

export default function DashboardOverviewClient() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  const [data, setData] = useState<DashboardData>({
    profile: null,
    stats: null,
    reviews: [],
    watchlist: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push("/sign-in");
      return;
    }
    if (!session) return;

    async function loadDashboard() {
      try {
        const [profileRes, statsRes, reviewsRes, watchlistRes] = await Promise.all([
          api.get<ApiResponse<User>>("/users/profile"),
          api.get<ApiResponse<UserDashboardStats>>("/users/dashboard-stats"),
          api.get<ApiResponse<Review[]>>("/reviews/my"),
          api.get<ApiResponse<WatchlistItem[]>>("/watchlist"),
        ]);
        
        setData({
          profile: profileRes.data ?? null,
          stats: statsRes.data ?? null,
          reviews: reviewsRes.data ?? [],
          watchlist: watchlistRes.data ?? [],
        });
      } catch (err) {
        console.error("Dashboard load error", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [session, sessionLoading, router]);

  const subInfo = useMemo(() => {
    const sub = data.stats?.subscription;
    const plan = sub?.plan ?? "FREE";
    const isAdmin = sub?.adminAccess || data.profile?.role === "ADMIN";
    
    return {
      plan,
      isAdmin,
      isPaid: plan !== "FREE" && !isAdmin,
      isActive: sub?.status === "ACTIVE",
      config: isAdmin ? PLAN_CONFIG.ADMIN : PLAN_CONFIG[plan] || PLAN_CONFIG.FREE
    };
  }, [data.stats, data.profile]);

  if (sessionLoading || loading) return <DashboardSkeleton />;
  if (!data.profile || !data.stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── Welcome Header ── */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-background shadow-xl shrink-0">
              <AvatarImage src={data.profile.image ?? undefined} alt={data.profile.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {data.profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {subInfo.isActive && (
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                <MdVerified className={cn("w-5 h-5", subInfo.isAdmin ? "text-primary" : "text-emerald-400")} />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {data.profile.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground text-sm font-medium">
              You have <span className="text-foreground">{data.stats.watchlistCount} items</span> to catch up on today.
            </p>
          </div>
        </div>
        <div className="hidden lg:block text-right">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Account Standing</p>
          <Badge variant="outline" className={cn("px-3 py-1", subInfo.config.color)}>
            {subInfo.config.label}
          </Badge>
        </div>
      </section>

      {/* ── Key Metrics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Reviews"
          value={data.stats.totalReviews}
          icon={<FiMessageSquare className="text-primary" />}
          footer={data.stats.pendingReviews > 0 ? `${data.stats.pendingReviews} awaiting approval` : "All reviews published"}
          footerColor={data.stats.pendingReviews > 0 ? "text-amber-500" : "text-emerald-500"}
        />
        <MetricCard
          title="Watchlist"
          value={data.stats.watchlistCount}
          icon={<FiBookmark className="text-blue-400" />}
          footer="Items saved for later"
        />
        <MetricCard
          title="Avg. Rating"
          value={data.stats.avgRating?.toFixed(1) ?? "N/A"}
          icon={<FiStar className="text-amber-400" />}
          footer={`${data.stats.approvedReviews} rated movies`}
        />
        <MetricCard
          title="Subscription"
          value={subInfo.isAdmin ? "Infinity" : subInfo.isActive ? `${data.stats.daysRemaining} Days` : "Basic"}
          icon={<FiCreditCard className={subInfo.isActive ? "text-emerald-400" : "text-muted-foreground"} />}
          footer={subInfo.isAdmin ? "Master Access" : subInfo.isActive ? "Renews automatically" : "Limited features"}
          highlight={subInfo.isPaid}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-1 shadow-sm overflow-hidden border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-bold">Recent Reviews</CardTitle>
            <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-primary">
              <Link href="/dashboard/reviews">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            {data.reviews.length > 0 ? (
              <div className="divide-y divide-border/40">
                {data.reviews.slice(0, 4).map((r) => (
                  <div key={r.id} className="px-6 py-3 hover:bg-muted/30 transition-colors flex justify-between items-center">
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-bold truncate">{r.media?.title ?? "Untitled"}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-amber-500">{r.rating}/5</span>
                        <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted border border-border/50 uppercase font-bold">
                          {r.status}
                        </span>
                      </div>
                    </div>
                    <FiArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-muted-foreground">
                <FiMessageSquare className="w-8 h-8 opacity-20 mx-auto mb-2" />
                <p className="text-xs">No reviews yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Watchlist Quick Access */}
        <Card className="lg:col-span-1 shadow-sm overflow-hidden border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-bold">Watchlist</CardTitle>
            <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-primary">
              <Link href="/dashboard/watchlist">Explore</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            {data.watchlist.length > 0 ? (
              <div className="divide-y divide-border/40">
                {data.watchlist.slice(0, 4).map(({ media }) => (
                  <div key={media.id} className="px-6 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{media.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">{media.releaseYear} • {media.type}</p>
                    </div>
                    {media.pricing === "premium" && (
                      <Badge variant="outline" className="text-[9px] h-4 bg-primary/5 text-primary border-primary/20 uppercase px-1">Pro</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-muted-foreground">
                <FiBookmark className="w-8 h-8 opacity-20 mx-auto mb-2" />
                <p className="text-xs">Watchlist is empty.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Info Card */}
        <Card className={cn(
          "lg:col-span-1 shadow-md border-border/60 overflow-hidden relative",
          subInfo.isPaid && "bg-gradient-to-br from-background to-secondary/20"
        )}>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FiCreditCard className="text-primary" /> Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl border", subInfo.config.color)}>
                <MdVerified className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">{subInfo.config.label}</p>
                <p className="text-xs text-muted-foreground font-medium">
                  {subInfo.isActive ? `Valid for ${data.stats.daysRemaining} more days` : "Basic member privileges"}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 bg-muted/30 p-4 rounded-2xl border border-border/50">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Unlocked Features</p>
              <div className="grid gap-2">
                {[
                  { label: "Unlimited Reviews", active: true },
                  { label: "Premium Content", active: subInfo.isActive },
                  { label: "Early Access", active: subInfo.isAdmin }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium">
                    <FiCheck className={cn("w-3 h-3", feature.active ? "text-emerald-500" : "text-muted-foreground/40")} />
                    <span className={feature.active ? "text-foreground" : "text-muted-foreground"}>{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button className="w-full shadow-lg" asChild variant={subInfo.isPaid ? "secondary" : "default"}>
              <Link href="/dashboard/subscription">
                {subInfo.isPaid ? "Billing Details" : "View Pro Plans"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Internal Helper Components ---

function MetricCard({ title, value, icon, footer, footerColor = "text-muted-foreground", highlight = false }: MetricCardProps) {
  return (
    <Card className={cn("border-border/50 transition-all hover:shadow-md", highlight && "border-primary/20 bg-primary/[0.02]")}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-muted/60 rounded-lg">{icon}</div>
          <FiTrendingUp className="text-muted-foreground/30 w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
        </div>
        <div className={cn("mt-4 pt-3 border-t border-border/30 text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-tighter", footerColor)}>
          <FiClock className="w-3 h-3" /> {footer}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-xl lg:col-span-1" />
        <Skeleton className="h-64 rounded-xl lg:col-span-1" />
        <Skeleton className="h-64 rounded-xl lg:col-span-1" />
      </div>
    </div>
  );
}