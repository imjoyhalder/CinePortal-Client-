"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMessageSquare, FiFilter } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReviewCard from "@/components/reviews/review-card";
import EditReviewDialog from "@/components/reviews/edit-review-dialog";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import type { ApiResponse, Review } from "@/types";

type Filter = "ALL" | "PENDING" | "APPROVED" | "UNPUBLISHED";

export default function DashboardReviewsClient() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [reviews,       setReviews]       = useState<Review[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState<Filter>("ALL");
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    if (!isPending && !session) { router.push("/sign-in"); return; }
    if (!session) return;

    api.get<ApiResponse<Review[]>>("/reviews/my")
      .then((r) => setReviews(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, isPending, router]);

  if (isPending || loading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const filtered = filter === "ALL" ? reviews : reviews.filter((r) => r.status === filter);
  const counts = {
    ALL:         reviews.length,
    PENDING:     reviews.filter((r) => r.status === "PENDING").length,
    APPROVED:    reviews.filter((r) => r.status === "APPROVED").length,
    UNPUBLISHED: reviews.filter((r) => r.status === "UNPUBLISHED").length,
  };

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Reviews</h1>
          <p className="text-sm text-muted-foreground">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""} · {counts.APPROVED} approved · {counts.PENDING} pending
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FiFilter className="w-4 h-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All ({counts.ALL})</SelectItem>
              <SelectItem value="PENDING">Pending ({counts.PENDING})</SelectItem>
              <SelectItem value="APPROVED">Approved ({counts.APPROVED})</SelectItem>
              <SelectItem value="UNPUBLISHED">Unpublished ({counts.UNPUBLISHED})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <FiMessageSquare className="w-8 h-8 opacity-30" />
          </div>
          <p className="font-semibold text-foreground mb-1">
            {filter === "ALL" ? "No reviews yet" : `No ${filter.toLowerCase()} reviews`}
          </p>
          <p className="text-sm mb-5">
            {filter === "ALL" ? "Start watching and share your thoughts." : "Try a different filter."}
          </p>
          {filter === "ALL" && (
            <Button asChild><Link href="/movies">Browse Movies</Link></Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              showMedia
              onDeleted={r.status === "PENDING" ? () => setReviews((prev) => prev.filter((x) => x.id !== r.id)) : undefined}
              onEdit={r.status === "PENDING" ? () => setEditingReview(r) : undefined}
            />
          ))}
        </div>
      )}

      <EditReviewDialog
        review={editingReview}
        onClose={() => setEditingReview(null)}
        onSaved={(updated) => setReviews((prev) => prev.map((r) => r.id === updated.id ? updated : r))}
      />
    </div>
  );
}
