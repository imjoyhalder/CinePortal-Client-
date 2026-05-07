// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   FiMessageSquare, FiBookmark, FiStar, FiCreditCard,
//   FiArrowRight, FiCheck, FiShield, FiTrendingUp,
// } from "react-icons/fi";
// import { MdVerified } from "react-icons/md";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useSession } from "@/lib/auth-client";
// import { api } from "@/lib/api";
// import type { ApiResponse, User, Review, UserDashboardStats, WatchlistItem } from "@/types";

// const PLAN_LABEL: Record<string, string> = {
//   FREE: "Free",
//   MONTHLY: "Monthly Pro",
//   YEARLY: "Annual Premium",
//   ADMIN: "Admin",
// };

// function planColor(plan: string, isAdmin: boolean) {
//   if (isAdmin)            return "bg-primary/15 text-primary border-primary/30";
//   if (plan === "YEARLY")  return "bg-purple-500/15 text-purple-400 border-purple-500/30";
//   if (plan === "MONTHLY") return "bg-green-500/15 text-green-400 border-green-500/30";
//   return "bg-secondary text-secondary-foreground border-border/50";
// }

// export default function DashboardOverviewClient() {
//   const { data: session, isPending } = useSession();
//   const router = useRouter();

//   const [profile,  setProfile]  = useState<User | null>(null);
//   const [stats,    setStats]    = useState<UserDashboardStats | null>(null);
//   const [reviews,  setReviews]  = useState<Review[]>([]);
//   const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
//   const [loading,  setLoading]  = useState(true);

//   useEffect(() => {
//     if (!isPending && !session) { router.push("/sign-in"); return; }
//     if (!session) return;

//     async function load() {
//       try {
//         const [profileRes, statsRes, reviewsRes, watchlistRes] = await Promise.all([
//           api.get<ApiResponse<User>>("/users/profile"),
//           api.get<ApiResponse<UserDashboardStats>>("/users/dashboard-stats"),
//           api.get<ApiResponse<Review[]>>("/reviews/my"),
//           api.get<ApiResponse<WatchlistItem[]>>("/watchlist"),
//         ]);
//         setProfile(profileRes.data ?? null);
//         setStats(statsRes.data ?? null);
//         setReviews(reviewsRes.data ?? []);
//         setWatchlist(watchlistRes.data ?? []);
//       } catch { /* silently fail */ }
//       finally { setLoading(false); }
//     }
//     load();
//   }, [session, isPending, router]);

//   if (isPending || loading) {
//     return (
//       <div className="space-y-6">
//         <Skeleton className="h-32 w-full rounded-2xl" />
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {Array.from({ length: 4 }).map((_, i) => (
//             <Skeleton key={i} className="h-24 rounded-xl" />
//           ))}
//         </div>
//         <Skeleton className="h-64 w-full rounded-xl" />
//       </div>
//     );
//   }

//   if (!profile || !stats) return null;

//   const subscription = stats.subscription;
//   const isAdmin  = subscription?.adminAccess === true || profile.role === "ADMIN";
//   const plan     = subscription?.plan ?? "FREE";
//   const isPaid   = plan !== "FREE" && plan !== "ADMIN";
//   const isActive = subscription?.status === "ACTIVE";
//   const label    = isAdmin ? "Admin" : PLAN_LABEL[plan] ?? plan;
//   const pColor   = planColor(plan, isAdmin);

//   const avgRating       = stats.avgRating !== null ? stats.avgRating.toFixed(1) : null;
//   const daysRemaining   = stats.daysRemaining;
//   const pendingReviews  = stats.pendingReviews;
//   const approvedReviews = stats.approvedReviews;

//   return (
//     <div className="space-y-6 max-w-4xl">

//       {/* ── Header ─────────────────────────────────────────────────────────── */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="flex items-center gap-4">
//           <Avatar className="w-14 h-14 ring-2 ring-primary/20 shrink-0">
//             <AvatarImage src={profile.image ?? undefined} alt={profile.name} />
//             <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">
//               {profile.name.charAt(0).toUpperCase()}
//             </AvatarFallback>
//           </Avatar>
//           <div>
//             <div className="flex items-center gap-2 flex-wrap">
//               <h1 className="text-2xl font-bold">{profile.name}</h1>
//               {(isPaid && isActive) && (
//                 <Badge className={`text-xs ${pColor}`}>
//                   <MdVerified className="w-3 h-3 mr-1" />{label}
//                 </Badge>
//               )}
//               {isAdmin && (
//                 <Badge className="text-xs bg-primary/15 text-primary border-primary/30">
//                   <FiShield className="w-3 h-3 mr-1" />Admin
//                 </Badge>
//               )}
//             </div>
//             <p className="text-sm text-muted-foreground">{profile.email}</p>
//           </div>
//         </div>

//         <p className="text-xs text-muted-foreground shrink-0">
//           Member since{" "}
//           {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
//         </p>
//       </div>

//       {/* ── Stat cards (all values from backend) ───────────────────────────── */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <Card className="border-border/50">
//           <CardContent className="pt-5 pb-4">
//             <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-3">
//               <FiMessageSquare className="w-4 h-4 text-primary" />
//             </div>
//             <p className="text-2xl font-bold">{stats.totalReviews}</p>
//             <p className="text-xs text-muted-foreground">Total Reviews</p>
//             {pendingReviews > 0 && (
//               <p className="text-xs text-amber-400 mt-0.5">{pendingReviews} pending</p>
//             )}
//           </CardContent>
//         </Card>

//         <Card className="border-border/50">
//           <CardContent className="pt-5 pb-4">
//             <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
//               <FiBookmark className="w-4 h-4 text-blue-400" />
//             </div>
//             <p className="text-2xl font-bold">{stats.watchlistCount}</p>
//             <p className="text-xs text-muted-foreground">Watchlist</p>
//           </CardContent>
//         </Card>

//         <Card className="border-border/50">
//           <CardContent className="pt-5 pb-4">
//             <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
//               <FiStar className="w-4 h-4 text-amber-400" />
//             </div>
//             <p className="text-2xl font-bold">{avgRating ?? "—"}</p>
//             <p className="text-xs text-muted-foreground">Avg Rating / 5</p>
//             {approvedReviews > 0 && (
//               <p className="text-xs text-green-400 mt-0.5">{approvedReviews} approved</p>
//             )}
//           </CardContent>
//         </Card>

//         <Card className={`border-border/50 ${isPaid && isActive ? "border-green-500/20 bg-green-500/5" : ""}`}>
//           <CardContent className="pt-5 pb-4">
//             <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${isPaid && isActive ? "bg-green-500/15" : "bg-muted/60"}`}>
//               <FiCreditCard className={`w-4 h-4 ${isPaid && isActive ? "text-green-400" : "text-muted-foreground"}`} />
//             </div>
//             <p className="text-sm font-bold">{label}</p>
//             <p className="text-xs text-muted-foreground">
//               {isAdmin ? "Full access" : isPaid && isActive ? `${daysRemaining}d left` : "Free plan"}
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* ── Quick links grid ────────────────────────────────────────────────── */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

//         <Card className="border-border/50 hover:border-primary/30 transition-colors">
//           <CardHeader className="pb-2">
//             <div className="flex items-center justify-between">
//               <h2 className="font-semibold text-sm">Recent Reviews</h2>
//               <Link href="/dashboard/reviews" className="text-xs text-primary hover:underline flex items-center gap-0.5">
//                 View all <FiArrowRight className="w-3 h-3" />
//               </Link>
//             </div>
//           </CardHeader>
//           <CardContent className="space-y-2">
//             {reviews.slice(0, 3).length > 0 ? reviews.slice(0, 3).map((r) => (
//               <div key={r.id} className="flex items-center gap-2.5 py-1 border-b border-border/20 last:border-0">
//                 <div className="flex-1 min-w-0">
//                   <p className="text-xs font-medium truncate">{r.media?.title ?? "Unknown"}</p>
//                   <div className="flex items-center gap-2 mt-0.5">
//                     <span className="text-xs text-amber-400 font-semibold">{r.rating}/5</span>
//                     <Badge
//                       variant="secondary"
//                       className={`text-xs py-0 px-1.5 ${
//                         r.status === "APPROVED" ? "bg-green-500/15 text-green-400 border-green-500/20" :
//                         r.status === "PENDING"  ? "bg-amber-500/15 text-amber-400 border-amber-500/20" :
//                         "bg-red-500/15 text-red-400 border-red-500/20"
//                       }`}
//                     >
//                       {r.status}
//                     </Badge>
//                   </div>
//                 </div>
//               </div>
//             )) : (
//               <p className="text-xs text-muted-foreground py-2">No reviews yet</p>
//             )}
//             <Button variant="outline" size="sm" className="w-full text-xs h-8 mt-1" asChild>
//               <Link href="/dashboard/reviews">
//                 <FiMessageSquare className="w-3 h-3 mr-1.5" />
//                 {reviews.length > 0 ? "See all reviews" : "Write a review"}
//               </Link>
//             </Button>
//           </CardContent>
//         </Card>

//         <Card className="border-border/50 hover:border-blue-500/30 transition-colors">
//           <CardHeader className="pb-2">
//             <div className="flex items-center justify-between">
//               <h2 className="font-semibold text-sm">Watchlist</h2>
//               <Link href="/dashboard/watchlist" className="text-xs text-primary hover:underline flex items-center gap-0.5">
//                 View all <FiArrowRight className="w-3 h-3" />
//               </Link>
//             </div>
//           </CardHeader>
//           <CardContent>
//             {watchlist.slice(0, 3).length > 0 ? (
//               <div className="space-y-2 mb-3">
//                 {watchlist.slice(0, 3).map(({ media }) => (
//                   <div key={media.id} className="flex items-center gap-2 py-1 border-b border-border/20 last:border-0">
//                     <div className="flex-1 min-w-0">
//                       <p className="text-xs font-medium truncate">{media.title}</p>
//                       <p className="text-xs text-muted-foreground">{media.releaseYear} · {media.type}</p>
//                     </div>
//                     <Badge className={`text-xs ${media.pricing === "premium" ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary text-secondary-foreground"}`}>
//                       {media.pricing === "premium" ? "Premium" : "Free"}
//                     </Badge>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-xs text-muted-foreground py-2 mb-3">Nothing saved yet</p>
//             )}
//             <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
//               <Link href="/dashboard/watchlist">
//                 <FiBookmark className="w-3 h-3 mr-1.5" />
//                 {watchlist.length > 0 ? "Manage watchlist" : "Browse movies"}
//               </Link>
//             </Button>
//           </CardContent>
//         </Card>

//         <Card className={`border-border/50 ${isPaid && isActive ? "border-green-500/20" : ""} hover:border-green-500/30 transition-colors`}>
//           <CardHeader className="pb-2">
//             <h2 className="font-semibold text-sm">Subscription</h2>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             {isAdmin ? (
//               <div className="flex items-center gap-2 text-xs text-primary">
//                 <FiShield className="w-3.5 h-3.5" />
//                 <span className="font-medium">Admin — Full Access</span>
//               </div>
//             ) : isPaid && isActive ? (
//               <>
//                 <div className="flex items-center gap-2">
//                   <MdVerified className={`w-4 h-4 ${plan === "YEARLY" ? "text-purple-400" : "text-green-400"}`} />
//                   <span className="text-sm font-semibold">{PLAN_LABEL[plan]}</span>
//                 </div>
//                 {daysRemaining !== null && (
//                   <p className={`text-xs font-medium ${daysRemaining <= 7 ? "text-amber-400" : "text-green-400"}`}>
//                     {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
//                   </p>
//                 )}
//                 <div className="flex flex-wrap gap-1.5">
//                   {["Unlimited reviews", "All premium content", "Ad-free"].map((f) => (
//                     <span key={f} className="flex items-center gap-1 text-xs text-muted-foreground">
//                       <FiCheck className="w-2.5 h-2.5 text-green-400" />{f}
//                     </span>
//                   ))}
//                 </div>
//               </>
//             ) : (
//               <div className="space-y-2">
//                 <p className="text-xs text-muted-foreground">You&apos;re on the free plan.</p>
//                 <div className="flex items-center gap-1.5 text-xs text-primary">
//                   <FiTrendingUp className="w-3.5 h-3.5" />
//                   <span>Upgrade to unlock all features</span>
//                 </div>
//               </div>
//             )}
//             <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
//               <Link href="/dashboard/subscription">
//                 <FiCreditCard className="w-3 h-3 mr-1.5" />
//                 {isPaid && isActive ? "Manage subscription" : "View plans"}
//               </Link>
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }


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