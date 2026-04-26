"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FiArrowLeft,
  FiGlobe,
  FiEye,
  FiEyeOff,
  FiInfo,
  FiLoader,
  FiFilm,
  FiUsers,
  FiMonitor,
  FiLink,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
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

const urlOrEmpty = z
  .string()
  .refine((v) => !v || /^https?:\/\/.+/.test(v), { message: "Must be a valid URL" })
  .optional();

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  synopsis: z.string().min(10, "Synopsis must be at least 10 characters"),
  type: z.enum(["MOVIE", "SERIES"]),
  genre: z.string().min(1, "At least one genre required"),
  releaseYear: z.number().min(1888).max(new Date().getFullYear() + 2),
  director: z.string().min(1, "Director is required"),
  cast: z.string().min(1, "At least one cast member required"),
  streamingPlatforms: z.string().min(1, "At least one platform required"),
  posterUrl: urlOrEmpty,
  trailerUrl: urlOrEmpty,
  streamingUrl: urlOrEmpty,
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
  const [uploading, setUploading] = useState(false);
  const [isPublished, setIsPublished] = useState(movie?.isPublished ?? false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/proxy/upload/image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Upload failed");
      setValue("posterUrl", json.data.url, { shouldValidate: true });
      toast.success("Poster uploaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const posterUrlValue = watch("posterUrl");

  return (
    <div className="max-w-3xl space-y-8">

      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="mt-0.5 shrink-0"
        >
          <FiArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? "Edit Media" : "Add New Media"}
            </h1>
            {isEdit && (
              <Badge
                variant={isPublished ? "default" : "secondary"}
                className="text-xs"
              >
                {isPublished ? "Published" : "Unpublished"}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? `Admin / Media / ${movie.title}`
              : "Admin / Media / New"}
          </p>
        </div>

        {/* Publish toggle — edit only */}
        {isEdit && (
          <Button
            type="button"
            variant={isPublished ? "outline" : "default"}
            size="sm"
            className="gap-2 shrink-0 mt-0.5"
            onClick={() => setIsPublished(!isPublished)}
          >
            {isPublished ? (
              <>
                <FiEyeOff className="w-3.5 h-3.5" />
                Unpublish
              </>
            ) : (
              <>
                <FiEye className="w-3.5 h-3.5" />
                Publish
              </>
            )}
          </Button>
        )}
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

        {/* ── Section 1: Basic Information ── */}
        <div className="space-y-5">
          <SectionDivider label="Basic Information" />

          {/* Title — full width */}
          <div className="space-y-1.5">
            <Label>
              Title <span className="text-destructive">*</span>
            </Label>
            <Input placeholder="e.g., Inception" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Type | Pricing | Release Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("type")}
                onValueChange={(v) => v && setValue("type", v as "MOVIE" | "SERIES")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOVIE">Movie</SelectItem>
                  <SelectItem value="SERIES">Series</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>
                Pricing <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("pricing")}
                onValueChange={(v) => v && setValue("pricing", v as "free" | "premium")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>
                Release Year <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={1888}
                max={new Date().getFullYear() + 2}
                {...register("releaseYear", { valueAsNumber: true })}
              />
              {errors.releaseYear && (
                <p className="text-xs text-destructive">{errors.releaseYear.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 2: Details ── */}
        <div className="space-y-5">
          <SectionDivider label="Details" />

          {/* Director */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                Director <span className="text-destructive">*</span>
              </Label>
              <Input placeholder="Christopher Nolan" {...register("director")} />
              {errors.director && (
                <p className="text-xs text-destructive">{errors.director.message}</p>
              )}
            </div>
          </div>

          {/* Synopsis — full width */}
          <div className="space-y-1.5">
            <Label>
              Synopsis <span className="text-destructive">*</span>
            </Label>
            <Textarea
              rows={4}
              placeholder="Brief description of the plot..."
              {...register("synopsis")}
            />
            {errors.synopsis && (
              <p className="text-xs text-destructive">{errors.synopsis.message}</p>
            )}
          </div>
        </div>

        {/* ── Section 3: Classification ── */}
        <div className="space-y-5">
          <SectionDivider label="Classification" />

          {/* Genres | Cast */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <FiFilm className="w-3.5 h-3.5 text-muted-foreground" />
                Genres <span className="text-destructive">*</span>
              </Label>
              <Input placeholder="Action, Sci-Fi, Thriller" {...register("genre")} />
              {errors.genre ? (
                <p className="text-xs text-destructive">{errors.genre.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple values with commas
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <FiUsers className="w-3.5 h-3.5 text-muted-foreground" />
                Cast <span className="text-destructive">*</span>
              </Label>
              <Input placeholder="Leonardo DiCaprio, Tom Hardy" {...register("cast")} />
              {errors.cast ? (
                <p className="text-xs text-destructive">{errors.cast.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple values with commas
                </p>
              )}
            </div>
          </div>

          {/* Streaming Platforms — full width */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <FiMonitor className="w-3.5 h-3.5 text-muted-foreground" />
              Streaming Platforms <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Netflix, Prime Video, Disney+"
              {...register("streamingPlatforms")}
            />
            {errors.streamingPlatforms ? (
              <p className="text-xs text-destructive">
                {errors.streamingPlatforms.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Separate multiple values with commas
              </p>
            )}
          </div>
        </div>

        {/* ── Section 4: Media Links ── */}
        <div className="space-y-5">
          <SectionDivider label="Media Links" />

          {/* Poster — upload or URL */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <FiGlobe className="w-3.5 h-3.5 text-muted-foreground" />
              Poster Image
            </Label>

            <div className="flex gap-3 items-start">
              {/* Preview */}
              <div className="shrink-0">
                {posterUrlValue ? (
                  <div className="relative w-14 h-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={posterUrlValue}
                      alt="Poster preview"
                      className="w-14 h-20 object-cover rounded-md border border-border/50"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <button
                      type="button"
                      onClick={() => setValue("posterUrl", "", { shouldValidate: true })}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/80 transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-14 h-20 rounded-md border-2 border-dashed border-border/60 flex items-center justify-center bg-muted/30">
                    <FiUploadCloud className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                )}
              </div>

              {/* URL input + upload button */}
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="https://image.tmdb.org/t/p/w500/..."
                  {...register("posterUrl")}
                />
                {errors.posterUrl && (
                  <p className="text-xs text-destructive">{errors.posterUrl.message}</p>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs h-8"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <FiLoader className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FiUploadCloud className="w-3.5 h-3.5" />
                    )}
                    {uploading ? "Uploading…" : "Upload from device"}
                  </Button>
                  <span className="text-xs text-muted-foreground">JPEG, PNG, WebP · max 5 MB</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
          </div>

          {/* Trailer URL | Streaming URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <FiLink className="w-3.5 h-3.5 text-muted-foreground" />
                Trailer URL{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  (YouTube)
                </span>
              </Label>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                {...register("trailerUrl")}
              />
              {errors.trailerUrl && (
                <p className="text-xs text-destructive">{errors.trailerUrl.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <FiLink className="w-3.5 h-3.5 text-muted-foreground" />
                Streaming URL{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input placeholder="https://..." {...register("streamingUrl")} />
              {errors.streamingUrl && (
                <p className="text-xs text-destructive">{errors.streamingUrl.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* New media publish note */}
        {!isEdit && (
          <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3">
            <FiInfo className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              New media is saved as{" "}
              <strong className="text-foreground">Unpublished</strong> by default.
              Use the Publish button after creation to make it visible to users.
            </p>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex items-center gap-3 pt-2 border-t border-border/40">
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? (
              <>
                <FiLoader className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Media"
            )}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ── Section divider helper ── */
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1 bg-border/40" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/40" />
    </div>
  );
}
