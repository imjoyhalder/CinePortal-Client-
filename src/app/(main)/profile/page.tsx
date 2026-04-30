"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FiMail, FiCalendar, FiMessageSquare, FiBookmark,
  FiCreditCard, FiCheckCircle, FiAlertCircle, FiXCircle,
  FiTrash2, FiStar, FiShield,
} from "react-icons/fi";
import { MdMovieCreation } from "react-icons/md";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewCard from "@/components/reviews/review-card";
import EditReviewDialog from "@/components/reviews/edit-review-dialog";
import CheckoutButton from "@/components/payment/checkout-button";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { ApiResponse, User, Review, Subscription, WatchlistItem } from "@/types";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

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

  async function handleCancelSubscription() {
    if (!confirm("Cancel your subscription? It stays active until the end of the billing period.")) return;
    setCancelling(true);
    try {
      await api.post("/payments/subscription/cancel");
      toast.success("Subscription will cancel at the end of the billing period.");
      setSubscription((prev) => prev ? { ...prev, cancelAtPeriodEnd: true } : prev);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  }

  async function removeFromWatchlist(mediaId: string) {
    try {
      await api.delete(`/watchlist/${mediaId}`);
      setWatchlist((prev) => prev.filter((i) => i.media.id !== mediaId));
      toast.success("Removed from watchlist");
    } catch { toast.error("Failed to remove"); }
  }

  if (isPending || loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-5xl space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) return null;

  const isAdmin = subscription?.adminAccess === true || profile.role === "ADMIN";
  const plan = subscription?.plan ?? "FREE";
  const isPaid = plan !== "FREE" && plan !== "ADMIN";
  const isCancelling = subscription?.cancelAtPeriodEnd;
  const isExpired =
    !isAdmin &&
    subscription?.status === "CANCELLED" &&
    plan === "FREE" &&
    !!subscription?.currentPeriodStart;

  const daysRemaining =
    isPaid && subscription?.currentPeriodEnd
      ? Math.max(
          0,
          Math.ceil(
            (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        )
      : null;

  const planBadgeVariant = isPaid ? "default" : "secondary";

  const planLabel = isAdmin ? "Admin" : isPaid ? plan : "Free";
  const planColor = isAdmin
    ? "bg-primary/15 text-primary border-primary/30"
    : isPaid
    ? "bg-green-500/15 text-green-400 border-green-500/30"
    : "bg-secondary text-secondary-foreground border-border/50";

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      {/* ── Hero card ───────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden mb-6 border border-border/50">
        {/* Background gradient banner */}
        <div className="h-28 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start gap-5 -mt-10">
            <Avatar className="w-20 h-20 ring-4 ring-background shadow-xl">
              <AvatarImage src={profile.image ?? undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 mt-2 sm:mt-10">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                {profile.role === "ADMIN" && (
                  <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                    <FiShield className="w-3 h-3" /> Admin
                  </span>
                )}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${planColor}`}>
                  {planLabel}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <FiMail className="w-3.5 h-3.5" /> {profile.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5" />
                  Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick stats ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border-border/50">
          <CardContent className="pt-5 pb-4 flex flex-col items-center text-center gap-1">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-1">
              <FiMessageSquare className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{profile._count?.reviews ?? reviews.length}</p>
            <p className="text-xs text-muted-foreground">Reviews</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-5 pb-4 flex flex-col items-center text-center gap-1">
            <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center mb-1">
              <FiBookmark className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold">{watchlist.length}</p>
            <p className="text-xs text-muted-foreground">Watchlist</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-5 pb-4 flex flex-col items-center text-center gap-1">
            <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center mb-1">
              <FiStar className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold">
              {reviews.length > 0
                ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length / 10 * 5).toFixed(1)
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ────────────────────────────────────────── */}
      <Tabs defaultValue="reviews">
        <TabsList className="mb-6">
          <TabsTrigger value="reviews">
            My Reviews
            {reviews.length > 0 && (
              <span className="ml-1.5 text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                {reviews.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="watchlist">
            Watchlist
            {watchlist.length > 0 && (
              <span className="ml-1.5 text-xs bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full">
                {watchlist.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        {/* ── Reviews tab ───────────────────────────────── */}
        <TabsContent value="reviews">
          {reviews.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <FiMessageSquare className="w-8 h-8 opacity-30" />
              </div>
              <p className="font-semibold text-foreground mb-1">No reviews yet</p>
              <p className="text-sm mb-5">Start watching and share your thoughts.</p>
              <Button asChild>
                <Link href="/movies">Browse Movies</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((r) => (
                <ReviewCard
                  key={r.id}
                  review={{
                    ...r,
                    user: r.user ?? { id: profile.id, name: profile.name, image: profile.image },
                  }}
                  showMedia
                  onDeleted={() => setReviews((prev) => prev.filter((x) => x.id !== r.id))}
                  onEdit={() => setEditingReview(r)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Watchlist tab ─────────────────────────────── */}
        <TabsContent value="watchlist">
          {watchlist.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <FiBookmark className="w-8 h-8 opacity-30" />
              </div>
              <p className="font-semibold text-foreground mb-1">Watchlist is empty</p>
              <p className="text-sm mb-5">Save movies and series to watch later.</p>
              <Button asChild>
                <Link href="/movies">Browse Movies</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {watchlist.map(({ media }) => (
                <Card key={media.id} className="group overflow-hidden border-border/50 hover:border-primary/40 transition-colors">
                  <div className="relative aspect-[2/3] bg-muted">
                    {media.posterUrl ? (
                      <Image src={media.posterUrl} alt={media.title} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <MdMovieCreation className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <button
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                      onClick={(e) => { e.preventDefault(); removeFromWatchlist(media.id); }}
                      title="Remove from watchlist"
                    >
                      <FiTrash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                    <div className="absolute top-2 left-2">
                      <Badge className={`text-xs ${media.pricing === "premium" ? "bg-primary text-primary-foreground" : "bg-black/50 border-white/10"}`}>
                        {media.pricing === "premium" ? "Premium" : "Free"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-2.5">
                    <Link href={`/movies/${media.id}`} className="hover:text-primary transition-colors">
                      <p className="text-xs font-semibold line-clamp-2 leading-tight">{media.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{media.releaseYear}</p>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Subscription tab ──────────────────────────── */}
        <TabsContent value="subscription">
          <div className="max-w-lg space-y-4">

            {isAdmin ? (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <FiCheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Admin Account — Full Access</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      As an administrator, you have unrestricted access to all content and features.
                      No subscription is required.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {isExpired && (
                  <div className="flex items-start gap-3 p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-sm">
                    <FiXCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p>
                      Your subscription has expired. Upgrade again to restore premium access.
                    </p>
                  </div>
                )}

                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <FiCreditCard className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold">Current Plan</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    <div className="flex items-center justify-between py-2.5 border-b border-border/40">
                      <span className="text-sm text-muted-foreground">Plan</span>
                      <Badge variant={planBadgeVariant} className="font-semibold">{plan}</Badge>
                    </div>

                    {subscription?.status && (
                      <div className="flex items-center justify-between py-2.5 border-b border-border/40">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <span className="flex items-center gap-1.5 text-sm font-medium">
                          {subscription.status === "ACTIVE" ? (
                            <FiCheckCircle className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <FiXCircle className="w-3.5 h-3.5 text-destructive" />
                          )}
                          {subscription.status}
                        </span>
                      </div>
                    )}

                    {daysRemaining !== null && (
                      <div className="flex items-center justify-between py-2.5 border-b border-border/40">
                        <span className="text-sm text-muted-foreground">Days remaining</span>
                        <span className={`text-sm font-bold ${daysRemaining <= 7 ? "text-yellow-400" : "text-green-400"}`}>
                          {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
                          {daysRemaining <= 7 && daysRemaining > 0 && (
                            <span className="ml-1 text-xs font-normal text-yellow-400/70">— expiring soon</span>
                          )}
                        </span>
                      </div>
                    )}

                    {subscription?.currentPeriodEnd && (
                      <div className="flex items-center justify-between py-2.5 border-b border-border/40">
                        <span className="text-sm text-muted-foreground">
                          {isCancelling ? "Access until" : "Renews on"}
                        </span>
                        <span className="text-sm font-medium">
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                            month: "long", day: "numeric", year: "numeric",
                          })}
                        </span>
                      </div>
                    )}

                    {subscription?.currentPeriodStart && (
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-sm text-muted-foreground">Started</span>
                        <span className="text-sm">
                          {new Date(subscription.currentPeriodStart).toLocaleDateString("en-US", {
                            month: "long", day: "numeric", year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {isCancelling && (
                  <div className="flex items-start gap-3 p-3.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm">
                    <FiAlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-yellow-200">
                      Your subscription is set to cancel at the end of the billing period. You&apos;ll retain
                      access to premium content until{" "}
                      <strong>
                        {subscription?.currentPeriodEnd
                          ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                          : "period end"}
                      </strong>.
                    </p>
                  </div>
                )}

                {!isPaid && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-5 space-y-4">
                      <div>
                        <p className="font-semibold text-sm mb-1">
                          {isExpired ? "Reactivate Your Subscription" : "Upgrade to Premium"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Unlock unlimited reviews, premium content, and an ad-free experience.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <CheckoutButton plan="MONTHLY" className="flex-1 text-sm h-9" size="sm">
                          Monthly — $9.99/mo
                        </CheckoutButton>
                        <CheckoutButton plan="YEARLY" variant="outline" className="flex-1 text-sm h-9" size="sm">
                          Yearly — $95.88/yr
                        </CheckoutButton>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {isPaid && !isCancelling && (
                  <div className="pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/60"
                      onClick={handleCancelSubscription}
                      disabled={cancelling}
                    >
                      {cancelling ? "Cancelling..." : "Cancel Subscription"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      You&apos;ll keep access until the end of your current billing period.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <EditReviewDialog
        review={editingReview}
        onClose={() => setEditingReview(null)}
        onSaved={(updated) => setReviews((prev) => prev.map((r) => r.id === updated.id ? updated : r))}
      />
    </div>
  );
}
