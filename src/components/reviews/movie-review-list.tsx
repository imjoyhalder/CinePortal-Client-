"use client";

import { useState } from "react";
import {
  FiCheck, FiEyeOff, FiTrash2, FiMessageSquare, FiShield,
  FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { toast } from "sonner";
import ReviewCard from "./review-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

interface MovieReviewListProps {
  initialReviews: Review[];
  mediaId: string;
}

const STATUS_STYLE: Record<string, string> = {
  APPROVED:    "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
  PENDING:     "border-amber-500/30  text-amber-400  bg-amber-500/5",
  UNPUBLISHED: "border-red-500/30    text-red-400    bg-red-500/5",
};

const PAGE_SIZE = 6;

export default function MovieReviewList({ initialReviews }: MovieReviewListProps) {
  const { data: session } = useSession();
  const [reviews, setReviews]               = useState(initialReviews);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId]           = useState<string | null>(null);
  const [page, setPage]                       = useState(1);

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  const totalPages  = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const pagedReviews = reviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function moderate(reviewId: string, status: "APPROVED" | "UNPUBLISHED") {
    try {
      await api.patch(`/admin/reviews/${reviewId}/moderate`, { status });
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status } : r)));
      toast.success(status === "APPROVED" ? "Review approved" : "Review unpublished");
    } catch {
      toast.error("Failed to update review");
    }
  }

  async function adminDelete(reviewId: string) {
    setDeletingId(reviewId);
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  /* ── Empty state ── */
  if (!reviews.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border/50 bg-muted/5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
          <FiMessageSquare className="w-7 h-7 text-muted-foreground/40" />
        </div>
        <h3 className="font-semibold text-base">No Reviews Yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Be the first to share your thoughts!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Admin mode pill */}
      {isAdmin && (
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-1.5">
          <FiShield className="w-3.5 h-3.5" />
          Admin Mode — moderation controls active
        </div>
      )}

      {/* Review grid */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {pagedReviews.map((review) => (
          <div key={review.id} className="flex flex-col gap-2">

            {/* The review card itself */}
            <ReviewCard review={review} />

            {/* Admin moderation bar — sits cleanly below each card */}
            {isAdmin && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-border/40 bg-card/50">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    STATUS_STYLE[review.status] ?? "text-muted-foreground"
                  )}
                >
                  {review.status}
                </Badge>

                <div className="flex items-center gap-0.5">
                  {review.status !== "APPROVED" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Approve"
                      className="h-7 w-7 rounded-lg text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                      onClick={() => moderate(review.id, "APPROVED")}
                    >
                      <FiCheck className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {review.status !== "UNPUBLISHED" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Unpublish"
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => moderate(review.id, "UNPUBLISHED")}
                    >
                      <FiEyeOff className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Delete permanently"
                    className="h-7 w-7 rounded-lg text-destructive/60 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setConfirmDeleteId(review.id)}
                    disabled={deletingId === review.id}
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-border/50 text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FiChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>

          <span className="text-xs font-semibold text-muted-foreground px-2">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-border/50 text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <FiChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Admin delete confirmation dialog */}
      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open && !deletingId) setConfirmDeleteId(null); }}
        title="Delete Review"
        description="Permanently delete this review? This action cannot be undone."
        confirmLabel="Delete Review"
        loading={deletingId !== null}
        onConfirm={() => { if (confirmDeleteId) adminDelete(confirmDeleteId); }}
      />
    </div>
  );
}
