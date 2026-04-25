"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Review } from "@/types";

const schema = z.object({
  content: z.string().min(10, "Review must be at least 10 characters").max(5000),
  tags: z.string().optional(),
  hasSpoiler: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface EditReviewDialogProps {
  review: Review | null;
  onClose: () => void;
  onSaved: (updated: Review) => void;
}

export default function EditReviewDialog({ review, onClose, onSaved }: EditReviewDialogProps) {
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: review?.content ?? "",
      tags: review?.tags.join(", ") ?? "",
      hasSpoiler: review?.hasSpoiler ?? false,
    },
  });

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      reset({
        content: review.content,
        tags: review.tags.join(", "),
        hasSpoiler: review.hasSpoiler,
      });
    }
  }, [review?.id, reset]);

  async function onSubmit(values: FormValues) {
    if (!review) return;
    if (rating === 0) { toast.error("Please select a rating"); return; }
    setLoading(true);
    try {
      const res = await api.patch<{ success: boolean; data: Review }>(`/reviews/${review.id}`, {
        rating,
        content: values.content,
        tags: values.tags ? values.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        hasSpoiler: values.hasSpoiler,
      });
      toast.success("Review updated");
      onSaved(res.data!);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={!!review} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
        </DialogHeader>

        <div key={review?.id ?? "none"} className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                  >
                    {star <= (hover || rating) ? (
                      <AiFillStar className="w-6 h-6 text-primary" />
                    ) : (
                      <AiOutlineStar className="w-6 h-6 text-muted-foreground" />
                    )}
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {hover || rating || "?"}/10
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-content">Your Review</Label>
              <Textarea
                id="edit-content"
                rows={4}
                {...register("content")}
              />
              {errors.content && (
                <p className="text-xs text-destructive">{errors.content.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-tags">Tags (optional)</Label>
              <Input
                id="edit-tags"
                placeholder="must-watch, classic, underrated (comma separated)"
                {...register("tags")}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" className="rounded" {...register("hasSpoiler")} />
              Contains spoilers
            </label>

            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
