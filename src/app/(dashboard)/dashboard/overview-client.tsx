"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiMessageSquare, FiBookmark, FiStar, FiCreditCard,
  FiArrowRight, FiCheck, FiShield, FiTrendingUp,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import type { ApiResponse, User, Review, Subscription, WatchlistItem } from "@/types";

const PLAN_LABEL: Record<string, string> = {
  FREE: "Free",
  MONTHLY: "Monthly Pro",
  YEARLY: "Annual Premium",
  ADMIN: "Admin",
};

function planColor(plan: string, isAdmin: boolean) {
  if (isAdmin)            return "bg-primary/15 text-primary border-primary/30";
  if (plan === "YEARLY")  return "bg-purple-500/15 text-purple-400 border-purple-500/30";
  if (plan === "MONTHLY") return "bg-green-500/15 text-green-400 border-green-500/30";
  return "bg-secondary text-secondary-foreground border-border/50";
}

export default function DashboardOverviewClient() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [profile,      setProfile]      = useState<User | null>(null);
  const [reviews,      setReviews]      = useState<Review[]>([]);
  const [watchlist,    setWatchlist]    = useState<WatchlistItem[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    if (!isPending && !session) { router.push("/sign-in"); return; }
    if (!session) return;

    async function load() {
      try {
        const [profileRes, reviewsRes, watchlistRes, subRes] = await Promise.all([
          api.get<ApiResponse<User>>("/users/profile"),
          api.get<ApiResponse<Review[]>>("/reviews/my"),
          api.get<ApiResponse<WatchlistItem[]>>("/watchlist"),
          api.get<ApiResponse<Subscription | null>>("/payments/subscription"),
        ]);
        setProfile(profileRes.data ?? null);
        setReviews(reviewsRes.data ?? []);
        setWatchlist(watchlistRes.data ?? []);
        setSubscription(subRes.data ?? null);
      } catch { /* silently fail */ }
      finally { setLoading(false); }
    }
    load();
  }, [session, isPending, router]);

  if (isPending || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) return null;

  const isAdmin    = subscription?.adminAccess === true || profile.role === "ADMIN";
  const plan       = subscription?.plan ?? "FREE";
  const isPaid     = plan !== "FREE" && plan !== "ADMIN";
  const isActive   = subscription?.status === "ACTIVE";
  const label      = isAdmin ? "Admin" : PLAN_LABEL[plan] ?? plan;
  const pColor     = planColor(plan, isAdmin);

  const avgRating  = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const daysRemaining =
    isPaid && isActive && subscription?.currentPeriodEnd
      ? Math.max(0, Math.ceil(
          (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / 86_400_000
        ))
      : null;

  const pendingReviews = reviews.filter((r) => r.status === "PENDING").length;
  const approvedReviews = reviews.filter((r) => r.status === "APPROVED").length;

  return (
    <div className="space-y-6 max-w-4xl">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 ring-2 ring-primary/20 shrink-0">
            <AvatarImage src={profile.image ?? undefined} alt={profile.name} />
            <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              {(isPaid && isActive) && (
                <Badge className={`text-xs ${pColor}`}>
                  <MdVerified className="w-3 h-3 mr-1" />{label}
                </Badge>
              )}
              {isAdmin && (
                <Badge className="text-xs bg-primary/15 text-primary border-primary/30">
                  <FiShield className="w-3 h-3 mr-1" />Admin
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground shrink-0">
          Member since{" "}
          {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-5 pb-4">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <FiMessageSquare className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{reviews.length}</p>
            <p className="text-xs text-muted-foreground">Total Reviews</p>
            {pendingReviews > 0 && (
              <p className="text-xs text-amber-400 mt-0.5">{pendingReviews} pending</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-5 pb-4">
            <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
              <FiBookmark className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold">{watchlist.length}</p>
            <p className="text-xs text-muted-foreground">Watchlist</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-5 pb-4">
            <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
              <FiStar className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold">{avgRating ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Avg Rating / 10</p>
            {approvedReviews > 0 && (
              <p className="text-xs text-green-400 mt-0.5">{approvedReviews} approved</p>
            )}
          </CardContent>
        </Card>

        <Card className={`border-border/50 ${isPaid && isActive ? "border-green-500/20 bg-green-500/5" : ""}`}>
          <CardContent className="pt-5 pb-4">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${isPaid && isActive ? "bg-green-500/15" : "bg-muted/60"}`}>
              <FiCreditCard className={`w-4 h-4 ${isPaid && isActive ? "text-green-400" : "text-muted-foreground"}`} />
            </div>
            <p className="text-sm font-bold">{label}</p>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "Full access" : isPaid && isActive ? `${daysRemaining}d left` : "Free plan"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick links grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <Card className="border-border/50 hover:border-primary/30 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">Recent Reviews</h2>
              <Link href="/dashboard/reviews" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                View all <FiArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {reviews.slice(0, 3).length > 0 ? reviews.slice(0, 3).map((r) => (
              <div key={r.id} className="flex items-center gap-2.5 py-1 border-b border-border/20 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{r.media?.title ?? "Unknown"}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-amber-400 font-semibold">{r.rating}/10</span>
                    <Badge
                      variant="secondary"
                      className={`text-xs py-0 px-1.5 ${
                        r.status === "APPROVED" ? "bg-green-500/15 text-green-400 border-green-500/20" :
                        r.status === "PENDING"  ? "bg-amber-500/15 text-amber-400 border-amber-500/20" :
                        "bg-red-500/15 text-red-400 border-red-500/20"
                      }`}
                    >
                      {r.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground py-2">No reviews yet</p>
            )}
            <Button variant="outline" size="sm" className="w-full text-xs h-8 mt-1" asChild>
              <Link href="/dashboard/reviews">
                <FiMessageSquare className="w-3 h-3 mr-1.5" />
                {reviews.length > 0 ? "See all reviews" : "Write a review"}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-blue-500/30 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">Watchlist</h2>
              <Link href="/dashboard/watchlist" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                View all <FiArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {watchlist.slice(0, 3).length > 0 ? (
              <div className="space-y-2 mb-3">
                {watchlist.slice(0, 3).map(({ media }) => (
                  <div key={media.id} className="flex items-center gap-2 py-1 border-b border-border/20 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{media.title}</p>
                      <p className="text-xs text-muted-foreground">{media.releaseYear} · {media.type}</p>
                    </div>
                    <Badge className={`text-xs ${media.pricing === "premium" ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary text-secondary-foreground"}`}>
                      {media.pricing === "premium" ? "Premium" : "Free"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2 mb-3">Nothing saved yet</p>
            )}
            <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
              <Link href="/dashboard/watchlist">
                <FiBookmark className="w-3 h-3 mr-1.5" />
                {watchlist.length > 0 ? "Manage watchlist" : "Browse movies"}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className={`border-border/50 ${isPaid && isActive ? "border-green-500/20" : ""} hover:border-green-500/30 transition-colors`}>
          <CardHeader className="pb-2">
            <h2 className="font-semibold text-sm">Subscription</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {isAdmin ? (
              <div className="flex items-center gap-2 text-xs text-primary">
                <FiShield className="w-3.5 h-3.5" />
                <span className="font-medium">Admin — Full Access</span>
              </div>
            ) : isPaid && isActive ? (
              <>
                <div className="flex items-center gap-2">
                  <MdVerified className={`w-4 h-4 ${plan === "YEARLY" ? "text-purple-400" : "text-green-400"}`} />
                  <span className="text-sm font-semibold">{PLAN_LABEL[plan]}</span>
                </div>
                {daysRemaining !== null && (
                  <p className={`text-xs font-medium ${daysRemaining <= 7 ? "text-amber-400" : "text-green-400"}`}>
                    {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {["Unlimited reviews", "All premium content", "Ad-free"].map((f) => (
                    <span key={f} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FiCheck className="w-2.5 h-2.5 text-green-400" />{f}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">You&apos;re on the free plan.</p>
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <FiTrendingUp className="w-3.5 h-3.5" />
                  <span>Upgrade to unlock all features</span>
                </div>
              </div>
            )}
            <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
              <Link href="/dashboard/subscription">
                <FiCreditCard className="w-3 h-3 mr-1.5" />
                {isPaid && isActive ? "Manage subscription" : "View plans"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
