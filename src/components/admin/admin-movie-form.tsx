"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FiArrowLeft, FiLoader, FiFilm, FiUsers, FiMonitor,
  FiLink, FiUploadCloud, FiX, FiEye, FiEyeOff,
  FiInfo, FiStar, FiTag,
} from "react-icons/fi";
import { MdMovieCreation } from "react-icons/md";
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
  title:              z.string().min(1, "Title is required").max(200),
  synopsis:           z.string().min(10, "At least 10 characters"),
  type:               z.enum(["MOVIE", "SERIES"]),
  genre:              z.string().min(1, "At least one genre required"),
  releaseYear:        z.number().min(1888).max(new Date().getFullYear() + 2),
  director:           z.string().min(1, "Director is required"),
  cast:               z.string().min(1, "At least one cast member required"),
  streamingPlatforms: z.string().min(1, "At least one platform required"),
  posterUrl:          urlOrEmpty,
  trailerUrl:         urlOrEmpty,
  streamingUrl:       urlOrEmpty,
  pricing:            z.enum(["free", "premium"]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  movie?: Media;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdminMovieForm({ movie, onSuccess, onCancel }: Props) {
  const [loading,     setLoading]     = useState(false);
  const [uploading,   setUploading]   = useState(false);
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
          title:              movie.title,
          synopsis:           movie.synopsis,
          type:               movie.type,
          genre:              movie.genre.join(", "),
          releaseYear:        movie.releaseYear,
          director:           movie.director,
          cast:               movie.cast.join(", "),
          streamingPlatforms: movie.streamingPlatforms.join(", "),
          posterUrl:          movie.posterUrl ?? "",
          trailerUrl:         movie.trailerUrl ?? "",
          streamingUrl:       movie.streamingUrl ?? "",
          pricing:            movie.pricing,
        }
      : {
          type:        "MOVIE",
          pricing:     "free",
          releaseYear: new Date().getFullYear(),
        },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const payload = {
        ...values,
        genre:              values.genre.split(",").map((s) => s.trim()).filter(Boolean),
        cast:               values.cast.split(",").map((s) => s.trim()).filter(Boolean),
        streamingPlatforms: values.streamingPlatforms.split(",").map((s) => s.trim()).filter(Boolean),
        posterUrl:          values.posterUrl  || undefined,
        trailerUrl:         values.trailerUrl || undefined,
        streamingUrl:       values.streamingUrl || undefined,
      };
      if (isEdit) {
        await api.patch(`/movies/${movie.id}`, { ...payload, isPublished });
        toast.success("Media updated successfully");
      } else {
        await api.post("/movies", payload);
        toast.success("Media created! Publish it to make it visible.");
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
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res  = await fetch("/api/proxy/upload/image", { method: "POST", body: formData, credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Upload failed");
      setValue("posterUrl", json.data.url, { shouldValidate: true });
      toast.success("Poster uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const posterUrl  = watch("posterUrl");
  const typeValue  = watch("type");
  const priceValue = watch("pricing");

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onCancel} className="shrink-0">
          <FiArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <MdMovieCreation className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">{isEdit ? `Edit — ${movie.title}` : "Add New Media"}</h1>
            <p className="text-xs text-muted-foreground">Admin / Media / {isEdit ? "Edit" : "New"}</p>
          </div>
        </div>
        {isEdit && (
          <Badge variant={isPublished ? "default" : "secondary"} className="shrink-0 text-xs">
            {isPublished ? "Published" : "Draft"}
          </Badge>
        )}
      </div>

      {/* ── Two-column grid ─────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">

          {/* ── LEFT — main fields ──────────────────────────────────── */}
          <div className="space-y-5">

            {/* ▸ Basic Info card */}
            <FormCard icon={<FiFilm />} title="Basic Information">
              {/* Title */}
              <Field label="Title" required error={errors.title?.message}>
                <Input placeholder="e.g. Inception" {...register("title")} />
              </Field>

              {/* Type toggle */}
              <div className="space-y-1.5">
                <Label>Type <Req /></Label>
                <div className="flex gap-2">
                  {(["MOVIE", "SERIES"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setValue("type", t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        typeValue === t
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {t === "MOVIE" ? "🎬 Movie" : "📺 Series"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing toggle */}
              <div className="space-y-1.5">
                <Label>Pricing <Req /></Label>
                <div className="flex gap-2">
                  {(["free", "premium"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setValue("pricing", p)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        priceValue === p
                          ? p === "premium"
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {p === "free" ? "🆓 Free" : "⭐ Premium"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Release Year */}
              <Field label="Release Year" required error={errors.releaseYear?.message}>
                <Input
                  type="number"
                  min={1888}
                  max={new Date().getFullYear() + 2}
                  {...register("releaseYear", { valueAsNumber: true })}
                />
              </Field>
            </FormCard>

            {/* ▸ Credits card */}
            <FormCard icon={<FiUsers />} title="Credits">
              <Field label="Director" required error={errors.director?.message}>
                <Input placeholder="Christopher Nolan" {...register("director")} />
              </Field>

              <Field label="Cast" required error={errors.cast?.message} hint="Comma-separated">
                <Input placeholder="Leonardo DiCaprio, Tom Hardy, Elliot Page" {...register("cast")} />
              </Field>
            </FormCard>

            {/* ▸ Description card */}
            <FormCard icon={<FiTag />} title="Description & Classification">
              <Field label="Synopsis" required error={errors.synopsis?.message}>
                <Textarea rows={5} placeholder="Brief description of the plot…" className="resize-none" {...register("synopsis")} />
              </Field>

              <Field label="Genres" required error={errors.genre?.message} hint="Comma-separated">
                <Input placeholder="Action, Sci-Fi, Thriller" {...register("genre")} />
              </Field>

              <Field label="Streaming Platforms" required error={errors.streamingPlatforms?.message} hint="Comma-separated">
                <div className="relative">
                  <FiMonitor className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Netflix, Prime Video, Disney+" {...register("streamingPlatforms")} />
                </div>
              </Field>
            </FormCard>
          </div>

          {/* ── RIGHT — sidebar ─────────────────────────────────────── */}
          <div className="space-y-5">

            {/* ▸ Poster card */}
            <FormCard icon={<FiUploadCloud />} title="Poster Image">
              {/* Large preview */}
              <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden border-2 border-dashed border-border/60 bg-muted/30 flex items-center justify-center group">
                {posterUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={posterUrl}
                      alt="Poster preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <button
                      type="button"
                      onClick={() => setValue("posterUrl", "", { shouldValidate: true })}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-destructive hover:text-white hover:border-destructive transition-all"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground/50 p-6 text-center">
                    <FiUploadCloud className="w-10 h-10" />
                    <p className="text-xs">No poster yet</p>
                  </div>
                )}
              </div>

              {/* URL input */}
              <Field label="Poster URL" error={errors.posterUrl?.message}>
                <Input placeholder="https://image.tmdb.org/..." {...register("posterUrl")} />
              </Field>

              {/* Upload button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiUploadCloud className="w-3.5 h-3.5" />}
                {uploading ? "Uploading…" : "Upload from Device"}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">JPEG, PNG, WebP · max 5 MB</p>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
            </FormCard>

            {/* ▸ Media links card */}
            <FormCard icon={<FiLink />} title="Media Links">
              <Field label="Trailer URL" hint="YouTube" error={errors.trailerUrl?.message}>
                <Input placeholder="https://youtube.com/watch?v=…" {...register("trailerUrl")} />
              </Field>
              <Field label="Streaming URL" hint="Optional" error={errors.streamingUrl?.message}>
                <Input placeholder="https://..." {...register("streamingUrl")} />
              </Field>
            </FormCard>

            {/* ▸ Publish card (edit mode) */}
            {isEdit && (
              <FormCard icon={<FiStar />} title="Visibility">
                <div className={`rounded-lg p-4 border text-sm font-medium flex items-center justify-between ${
                  isPublished
                    ? "bg-green-500/10 border-green-500/30 text-green-700"
                    : "bg-muted/40 border-border/60 text-muted-foreground"
                }`}>
                  <div className="flex items-center gap-2">
                    {isPublished ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                    {isPublished ? "Published" : "Unpublished (Draft)"}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPublished(!isPublished)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${isPublished ? "bg-green-500" : "bg-muted-foreground/30"}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isPublished ? "translate-x-5" : ""}`} />
                  </button>
                </div>
              </FormCard>
            )}

            {/* New media note */}
            {!isEdit && (
              <div className="flex items-start gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
                <FiInfo className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  New media is saved as <strong className="text-foreground">Draft</strong>. Publish it from the movies list to make it visible.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-6 mt-6 border-t border-border/40">
          <Button type="submit" disabled={loading} className="gap-2 min-w-32">
            {loading
              ? <><FiLoader className="w-3.5 h-3.5 animate-spin" /> Saving…</>
              : isEdit ? "Save Changes" : "Create Media"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

/* ── Small helpers ──────────────────────────────────────────────────────── */

function Req() {
  return <span className="text-destructive ml-0.5">*</span>;
}

function Field({
  label, required, hint, error, children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1">
        {label} {required && <Req />}
        {hint && <span className="text-xs text-muted-foreground font-normal ml-1">({hint})</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function FormCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/40 bg-muted/30">
        <span className="text-primary w-4 h-4 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}
