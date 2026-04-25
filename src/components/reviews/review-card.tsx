"use client";

import { useState } from "react";
import Link from "next/link";
import { FiThumbsUp, FiMessageSquare, FiAlertTriangle } from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import type { Review } from "@/types";

interface ReviewCardProps {
  review: Review;
  showMedia?: boolean;
}

export default function ReviewCard({ review, showMedia = false }: ReviewCardProps) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(review._count.likes);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLike() {
    if (!session) {
      toast.error("Sign in to like reviews");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; data: { liked: boolean } }>(
        `/reviews/${review.id}/like`
      );
      setLiked(res.data!.liked);
      setLikes((prev) => (res.data!.liked ? prev + 1 : prev - 1));
    } catch {
      toast.error("Failed to update like");
    } finally {
      setLoading(false);
    }
  }

  const stars = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarImage src={review.user.image ?? undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {review.user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{review.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {stars.map((s) => (
              <AiFillStar
                key={s}
                className={`w-3.5 h-3.5 ${s <= review.rating ? "text-primary" : "text-muted-foreground/30"}`}
              />
            ))}
            <span className="text-sm font-bold ml-1 text-primary">{review.rating}/10</span>
          </div>
        </div>

        {showMedia && review.media && (
          <Link href={`/movies/${review.media.id}`} className="text-sm text-primary hover:underline mt-1 block">
            {review.media.title}
          </Link>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {review.hasSpoiler && (
          <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 rounded px-2 py-1.5">
            <FiAlertTriangle className="w-3 h-3" />
            <span>Spoiler Warning</span>
          </div>
        )}

        <p className="text-sm text-foreground/80 leading-relaxed">{review.content}</p>

        {review.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {review.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs py-0 px-2">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-1">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1.5 h-8 px-2 text-xs ${liked ? "text-primary" : "text-muted-foreground"}`}
            onClick={handleLike}
            disabled={loading}
          >
            <FiThumbsUp className="w-3.5 h-3.5" />
            {likes}
          </Button>
          <Link href={`/movies/${review.mediaId}#reviews`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1.5 h-8 px-2 text-xs text-muted-foreground">
              <FiMessageSquare className="w-3.5 h-3.5" />
              {review._count.comments}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
