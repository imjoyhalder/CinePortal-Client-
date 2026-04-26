"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiMail, FiCalendar, FiMessageSquare, FiBookmark,
  FiCreditCard, FiCheckCircle, FiAlertCircle, FiXCircle,
} from "react-icons/fi";
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
import type { ApiResponse, User, Review, Subscription } from "@/types";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    if (!isPending && !session) { router.push("/sign-in"); return; }
    if (!session) return;

    async function load() {
      try {
        const [profileRes, reviewsRes, subRes] = await Promise.all([
          api.get<ApiResponse<User>>("/users/profile"),
          api.get<ApiResponse<Review[]>>("/reviews/my"),
          api.get<ApiResponse<Subscription | null>>("/payments/subscription"),
        ]);
        setProfile(profileRes.data ?? null);
        setReviews(reviewsRes.data ?? []);
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

  if (isPending || loading) {
    return (
      <div className="container mx-auto px-4 py-10 space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
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

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Profile header */}
      <Card className="border-border/50 mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar className="w-20 h-20 ring-2 ring-primary/20">
              <AvatarImage src={profile.image ?? undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold">{profile.name}</h1>
                <Badge variant={profile.role === "ADMIN" ? "default" : "secondary"} className="text-xs">
                  {profile.role}
                </Badge>
                <Badge variant={planBadgeVariant} className="text-xs">
                  {plan}
                </Badge>
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
              <div className="flex gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1.5 font-medium">
                  <FiMessageSquare className="w-3.5 h-3.5 text-primary" />
                  {profile._count?.reviews ?? 0} Reviews
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <FiBookmark className="w-3.5 h-3.5 text-primary" />
                  {profile._count?.watchlist ?? 0} Watchlist
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="reviews">
        <TabsList className="mb-6">
          <TabsTrigger value="reviews">My Reviews</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        {/* ── Reviews tab ──────────────────────────────── */}
        <TabsContent value="reviews">
          {reviews.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FiMessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>You haven&apos;t written any reviews yet.</p>
              <Button className="mt-4" asChild>
                <a href="/movies">Browse Movies</a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((r) => (
                <ReviewCard
                  key={r.id}
                  review={r}
                  showMedia
                  onDeleted={() => setReviews((prev) => prev.filter((x) => x.id !== r.id))}
                  onEdit={() => setEditingReview(r)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Subscription tab ─────────────────────────── */}
        <TabsContent value="subscription">
          <div className="max-w-lg space-y-4">

            {/* Admin — full access banner */}
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
                {/* Expired notice */}
                {isExpired && (
                  <div className="flex items-start gap-3 p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-sm">
                    <FiXCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-destructive-foreground">
                      Your subscription has expired. Upgrade again to restore premium access.
                    </p>
                  </div>
                )}

                {/* Current plan card */}
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <FiCreditCard className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold">Current Plan</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between py-1 border-b border-border/40">
                      <span className="text-sm text-muted-foreground">Plan</span>
                      <Badge variant={planBadgeVariant} className="font-semibold">{plan}</Badge>
                    </div>

                    {subscription?.status && (
                      <div className="flex items-center justify-between py-1 border-b border-border/40">
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
                      <div className="flex items-center justify-between py-1 border-b border-border/40">
                        <span className="text-sm text-muted-foreground">Days remaining</span>
                        <span className={`text-sm font-semibold ${daysRemaining <= 7 ? "text-yellow-400" : "text-green-400"}`}>
                          {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    {subscription?.currentPeriodEnd && (
                      <div className="flex items-center justify-between py-1 border-b border-border/40">
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
                      <div className="flex items-center justify-between py-1">
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

                {/* Cancel warning banner */}
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
                      </strong>
                      .
                    </p>
                  </div>
                )}

                {/* FREE plan — upgrade options */}
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

                {/* Paid plan — cancel option */}
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
