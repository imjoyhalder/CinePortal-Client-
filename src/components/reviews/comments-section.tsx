"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMessageSquare, FiSend, FiCornerDownRight, FiLock } from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import type { Comment, ApiResponse, Subscription } from "@/types";

interface CommentsSectionProps {
  reviewId: string;
  pricing?: "free" | "premium";
}

function CommentItem({ comment, onReply, currentUserId, onDelete }: { comment: Comment; reviewId: string; onReply: (id: string) => void; currentUserId?: string; onDelete?: () => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2.5">
        <Avatar className="w-7 h-7 shrink-0">
          <AvatarImage src={comment.user.image ?? undefined} />
          <AvatarFallback className="text-[10px] bg-muted">{comment.user.name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="bg-muted/50 rounded-xl px-3 py-2">
            <p className="text-xs font-semibold mb-0.5">{comment.user.name}</p>
            <p className="text-sm text-foreground/80 leading-relaxed">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 ml-1">
            <span className="text-[11px] text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <button
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => onReply(comment.id)}
            >
              Reply
            </button>
            {currentUserId && currentUserId === comment.user.id && onDelete && (
              <button
                className="text-[11px] text-destructive/70 hover:text-destructive transition-colors"
                onClick={onDelete}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-9 space-y-2 border-l-2 border-border/30 pl-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex items-start gap-2">
              <FiCornerDownRight className="w-3 h-3 text-muted-foreground/50 shrink-0 mt-1.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Avatar className="w-5 h-5 shrink-0">
                    <AvatarFallback className="text-[8px] bg-muted">{reply.user.name[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{reply.user.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(reply.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 mt-0.5 ml-7">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentsSection({ reviewId, pricing }: CommentsSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  useEffect(() => {
    loadComments();
  }, [reviewId]);

  useEffect(() => {
    if (!showForm || pricing !== "premium" || !session || isAdmin) return;
    if (hasSubscription !== null) return;

    api.get<ApiResponse<Subscription>>("/payments/subscription")
      .then((r) => {
        const sub = r.data;
        setHasSubscription(
          sub?.status === "ACTIVE" && sub.plan !== "FREE"
        );
      })
      .catch(() => setHasSubscription(false));
  }, [showForm, pricing, session, isAdmin, hasSubscription]);

  async function loadComments() {
    try {
      const data = await api.get<{ data: Comment[] }>(`/comments/review/${reviewId}`);
      setComments(data.data ?? []);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  }

  async function handleSubmit() {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/comments", {
        reviewId,
        content: content.trim(),
        parentId: replyTo ?? undefined,
      });
      setContent("");
      setReplyTo(null);
      setShowForm(false);
      await loadComments();
      toast.success("Comment posted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  const totalComments = comments.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0);
  const isPremium = pricing === "premium";
  const canComment = isAdmin || !isPremium || hasSubscription === true;

  return (
    <div className="mt-4 pt-4 border-t border-border/30">
      <button
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        onClick={() => setShowForm((v) => !v)}
      >
        <FiMessageSquare className="w-3.5 h-3.5" />
        {totalComments > 0 ? `${totalComments} comment${totalComments !== 1 ? "s" : ""}` : "Add a comment"}
      </button>

      {showForm && (
        <div className="space-y-3">
          {comments.length > 0 && (
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  reviewId={reviewId}
                  onReply={(id) => { setReplyTo(id); setShowForm(true); }}
                  currentUserId={session?.user.id}
                  onDelete={() => handleDeleteComment(comment.id)}
                />
              ))}
            </div>
          )}
          {loading && <p className="text-xs text-muted-foreground">Loading...</p>}

          {session ? (
            canComment ? (
              <div className="flex gap-2 mt-2">
                <Avatar className="w-7 h-7 shrink-0">
                  <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                    {session.user.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  {replyTo && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <FiCornerDownRight className="w-3 h-3" /> Replying to comment{" "}
                      <button className="underline" onClick={() => setReplyTo(null)}>Cancel</button>
                    </p>
                  )}
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
                    rows={2}
                    className="text-sm resize-none"
                  />
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={handleSubmit}
                    disabled={submitting || !content.trim()}
                  >
                    <FiSend className="w-3 h-3" />
                    {submitting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2.5 py-4 px-4 rounded-xl border border-primary/20 bg-primary/5 text-center mt-2">
                <FiLock className="w-4 h-4 text-primary/70" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Commenting on premium content requires an active subscription.
                </p>
                <Button size="sm" asChild className="h-7 text-xs gap-1.5">
                  <Link href="/#pricing">
                    Upgrade Plan
                  </Link>
                </Button>
              </div>
            )
          ) : (
            <p className="text-xs text-muted-foreground">Sign in to comment</p>
          )}
        </div>
      )}
    </div>
  );
}
