"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";

const schema = z.object({
  content: z.string().min(10, "Review must be at least 10 characters").max(5000),
  tags: z.string().optional(),
  hasSpoiler: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface ReviewFormProps {
  mediaId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReviewForm({ mediaId, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { content: "", hasSpoiler: false },
  });

  async function onSubmit(values: FormValues) {
    if (rating === 0) { toast.error("Please select a rating"); return; }
    setLoading(true);
    try {
      await api.post("/reviews", {
        mediaId,
        rating,
        content: values.content,
        tags: values.tags ? values.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        hasSpoiler: values.hasSpoiler,
      });
      toast.success("Review submitted! It will appear after admin approval.");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <h3 className="font-semibold">Write Your Review</h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Star rating */}
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

          {/* Content */}
          <div className="space-y-1.5">
            <Label htmlFor="content">Your Review</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts about this movie or series..."
              rows={4}
              {...register("content")}
            />
            {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags (optional)</Label>
            <Input id="tags" placeholder="must-watch, classic, underrated (comma separated)" {...register("tags")} />
          </div>

          {/* Spoiler */}
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" className="rounded" {...register("hasSpoiler")} />
            Contains spoilers
          </label>

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
