"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiThumbsUp, FiAlertTriangle, FiEdit2, FiTrash2,
  FiChevronDown, FiChevronUp,
} from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import { MdVerified } from "react-icons/md";
import CommentsSection from "./comments-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

interface ReviewCardProps {
  review: Review;
  showMedia?: boolean;
  onDeleted?: () => void;
  onEdit?: () => void;
}

function isPremiumAuthor(user: Review["user"]): boolean {
  return (
    (user?.subscription?.status === "ACTIVE" &&
      (user.subscription.plan === "MONTHLY" || user.subscription.plan === "YEARLY")) ??
    false
  );
}

const TRUNCATE_AT = 220;

export default function ReviewCard({ review, showMedia = false, onDeleted, onEdit }: ReviewCardProps) {
  const { data: session } = useSession();
  const [likes, setLikes]               = useState(review._count?.likes ?? 0);
  const [liked, setLiked]               = useState(false);
  const [likeLoading, setLikeLoading]   = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [expanded, setExpanded]         = useState(false);

  const isLong = review.content.length > TRUNCATE_AT;

  async function handleLike() {
    if (!session) { toast.error("Sign in to like reviews"); return; }
    setLikeLoading(true);
    try {
      const res = await api.post<{ success: boolean; data: { liked: boolean } }>(
        `/reviews/${review.id}/like`
      );
      setLiked(res.data!.liked);
      setLikes((p) => (res.data!.liked ? p + 1 : p - 1));
    } catch {
      toast.error("Failed to update like");
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/reviews/${review.id}`);
      toast.success("Review deleted");
      setConfirmDelete(false);
      onDeleted?.();
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-border hover:shadow-lg transition-all duration-200">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="w-10 h-10 shrink-0 ring-2 ring-border/40">
            <AvatarImage
              src={review.user?.image ?? undefined}
              alt={review.user?.name ?? "User"}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
              {review.user?.name?.charAt(0).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-semibold leading-tight truncate">
                {review.user?.name ?? "Anonymous"}
              </p>
              {isPremiumAuthor(review.user) && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 uppercase tracking-wide shrink-0">
                  <MdVerified className="w-2.5 h-2.5" /> PRO
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(review.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Star rating */}
        <div className="flex items-center gap-0.5 shrink-0">
          {Array.from({ length: 5 }, (_, i) => (
            <AiFillStar
              key={i}
              className={cn(
                "w-3.5 h-3.5",
                i < review.rating ? "text-yellow-400" : "text-muted-foreground/20"
              )}
            />
          ))}
          <span className="text-xs font-bold text-primary ml-1.5">{review.rating}/5</span>
        </div>
      </div>

      {/* ── Media link ── */}
      {showMedia && review.media && (
        <div className="px-4 pb-2">
          <Link
            href={`/movies/${review.media.id}`}
            className="text-xs text-primary hover:underline font-medium"
          >
            ↗ {review.media.title}
          </Link>
        </div>
      )}

      {/* ── Body ── */}
      <div className="px-4 pb-3 space-y-2.5">
        {review.hasSpoiler && (
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            <FiAlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium">Spoiler Warning</span>
          </div>
        )}

        <p
          className={cn(
            "text-sm text-foreground/80 leading-relaxed",
            !expanded && isLong && "line-clamp-4"
          )}
        >
          {review.content}
        </p>

        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            {expanded
              ? <><FiChevronUp className="w-3 h-3" /> Show less</>
              : <><FiChevronDown className="w-3 h-3" /> Read more</>
            }
          </button>
        )}

        {review.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {review.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] h-5 px-2 font-medium">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/30 bg-muted/5">
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium rounded-lg px-2 py-1 transition-colors",
            liked
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <FiThumbsUp className={cn("w-3.5 h-3.5", liked && "fill-current")} />
          {likes > 0 ? likes : ""}
          <span>{likes === 1 ? "Like" : "Likes"}</span>
        </button>

        {(onEdit || onDeleted) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                onClick={onEdit}
              >
                <FiEdit2 className="w-3 h-3" /> Edit
              </Button>
            )}
            {onDeleted && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmDelete(true)}
                disabled={deleting}
              >
                <FiTrash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── Comments ── */}
      <div className="px-4">
        <CommentsSection reviewId={review.id} pricing={review.media?.pricing} />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={(open) => { if (!deleting) setConfirmDelete(open); }}
        title="Delete Review"
        description="Permanently delete this review? This cannot be undone."
        confirmLabel="Delete Review"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
