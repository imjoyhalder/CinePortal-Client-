"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiArrowLeft, FiGlobe, FiEye, FiEyeOff } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Media } from "@/types";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  synopsis: z.string().min(10, "Synopsis must be at least 10 characters"),
  type: z.enum(["MOVIE", "SERIES"]),
  genre: z.string().min(1, "At least one genre required"),
  releaseYear: z.number().min(1888).max(new Date().getFullYear() + 2),
  director: z.string().min(1, "Director is required"),
  cast: z.string().min(1, "At least one cast member required"),
  streamingPlatforms: z.string().min(1, "At least one platform required"),
  posterUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  trailerUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  streamingUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  pricing: z.enum(["free", "premium"]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  movie?: Media;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdminMovieForm({ movie, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(movie?.isPublished ?? false);
  const isEdit = !!movie;

  const {
    register, handleSubmit, setValue, watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: movie
      ? {
          title: movie.title,
          synopsis: movie.synopsis,
          type: movie.type,
          genre: movie.genre.join(", "),
          releaseYear: movie.releaseYear,
          director: movie.director,
          cast: movie.cast.join(", "),
          streamingPlatforms: movie.streamingPlatforms.join(", "),
          posterUrl: movie.posterUrl ?? "",
          trailerUrl: movie.trailerUrl ?? "",
          streamingUrl: movie.streamingUrl ?? "",
          pricing: movie.pricing,
        }
      : {
          type: "MOVIE",
          pricing: "free",
          releaseYear: new Date().getFullYear(),
        },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const payload = {
        ...values,
        genre: values.genre.split(",").map((s) => s.trim()).filter(Boolean),
        cast: values.cast.split(",").map((s) => s.trim()).filter(Boolean),
        streamingPlatforms: values.streamingPlatforms.split(",").map((s) => s.trim()).filter(Boolean),
        posterUrl: values.posterUrl || undefined,
        trailerUrl: values.trailerUrl || undefined,
        streamingUrl: values.streamingUrl || undefined,
      };

      if (isEdit) {
        await api.patch(`/movies/${movie.id}`, { ...payload, isPublished });
        toast.success("Media updated successfully");
      } else {
        await api.post("/movies", payload);
        toast.success("Media created! It will appear after publishing.");
      }
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  const posterUrlValue = watch("posterUrl");

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <FiArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{isEdit ? "Edit" : "Add"} Media</h1>
            {isEdit && (
              <Badge variant={isPublished ? "default" : "secondary"} className="text-xs">
                {isPublished ? "Published" : "Unpublished"}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isEdit ? `Editing "${movie.title}"` : "Add a new movie or series to the catalog"}
          </p>
        </div>

        {/* Publish toggle — edit only */}
        {isEdit && (
          <Button
            type="button"
            variant={isPublished ? "outline" : "default"}
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => setIsPublished(!isPublished)}
          >
            {isPublished ? (
              <><FiEyeOff className="w-3.5 h-3.5" /> Unpublish</>
            ) : (
              <><FiEye className="w-3.5 h-3.5" /> Publish</>
            )}
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Title */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input placeholder="e.g., Inception" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Type <span className="text-destructive">*</span></Label>
            <Select
              value={watch("type")}
              onValueChange={(v) => v && setValue("type", v as "MOVIE" | "SERIES")}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MOVIE">Movie</SelectItem>
                <SelectItem value="SERIES">Series</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pricing */}
          <div className="space-y-1.5">
            <Label>Pricing <span className="text-destructive">*</span></Label>
            <Select
              value={watch("pricing")}
              onValueChange={(v) => v && setValue("pricing", v as "free" | "premium")}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Release Year */}
          <div className="space-y-1.5">
            <Label>Release Year <span className="text-destructive">*</span></Label>
            <Input
              type="number"
              min={1888}
              max={new Date().getFullYear() + 2}
              {...register("releaseYear", { valueAsNumber: true })}
            />
            {errors.releaseYear && <p className="text-xs text-destructive">{errors.releaseYear.message}</p>}
          </div>

          {/* Director */}
          <div className="space-y-1.5">
            <Label>Director <span className="text-destructive">*</span></Label>
            <Input placeholder="Christopher Nolan" {...register("director")} />
            {errors.director && <p className="text-xs text-destructive">{errors.director.message}</p>}
          </div>

          {/* Synopsis */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Synopsis <span className="text-destructive">*</span></Label>
            <Textarea
              rows={4}
              placeholder="Brief description of the plot..."
              {...register("synopsis")}
            />
            {errors.synopsis && <p className="text-xs text-destructive">{errors.synopsis.message}</p>}
          </div>

          {/* Genres */}
          <div className="space-y-1.5">
            <Label>
              Genres <span className="text-destructive">*</span>{" "}
              <span className="text-xs text-muted-foreground font-normal">(comma separated)</span>
            </Label>
            <Input placeholder="Action, Sci-Fi, Thriller" {...register("genre")} />
            {errors.genre && <p className="text-xs text-destructive">{errors.genre.message}</p>}
          </div>

          {/* Cast */}
          <div className="space-y-1.5">
            <Label>
              Cast <span className="text-destructive">*</span>{" "}
              <span className="text-xs text-muted-foreground font-normal">(comma separated)</span>
            </Label>
            <Input placeholder="Leonardo DiCaprio, Tom Hardy" {...register("cast")} />
            {errors.cast && <p className="text-xs text-destructive">{errors.cast.message}</p>}
          </div>

          {/* Streaming Platforms */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label>
              Streaming Platforms <span className="text-destructive">*</span>{" "}
              <span className="text-xs text-muted-foreground font-normal">(comma separated)</span>
            </Label>
            <Input placeholder="Netflix, Prime Video, Disney+" {...register("streamingPlatforms")} />
            {errors.streamingPlatforms && <p className="text-xs text-destructive">{errors.streamingPlatforms.message}</p>}
          </div>

          {/* Poster URL */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <FiGlobe className="w-3.5 h-3.5" /> Poster URL
              <span className="text-xs text-muted-foreground font-normal ml-1">(TMDB, IMDB, or direct image link)</span>
            </Label>
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <Input placeholder="https://image.tmdb.org/t/p/w500/..." {...register("posterUrl")} />
                {errors.posterUrl && <p className="text-xs text-destructive mt-1">{errors.posterUrl.message}</p>}
              </div>
              {posterUrlValue && !errors.posterUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={posterUrlValue}
                  alt="Poster preview"
                  className="w-14 h-20 object-cover rounded-md border border-border/50 shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
            </div>
          </div>

          {/* Trailer URL */}
          <div className="space-y-1.5">
            <Label>Trailer URL <span className="text-xs text-muted-foreground font-normal">(YouTube)</span></Label>
            <Input placeholder="https://youtube.com/watch?v=..." {...register("trailerUrl")} />
            {errors.trailerUrl && <p className="text-xs text-destructive">{errors.trailerUrl.message}</p>}
          </div>

          {/* Streaming URL */}
          <div className="space-y-1.5">
            <Label>Streaming URL <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
            <Input placeholder="https://..." {...register("streamingUrl")} />
            {errors.streamingUrl && <p className="text-xs text-destructive">{errors.streamingUrl.message}</p>}
          </div>
        </div>

        {/* New movie publish note */}
        {!isEdit && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            New media is saved as <strong>Unpublished</strong> by default. Use the Publish button after creation to make it visible to users.
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Media"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
