import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FiBookmark, FiMessageSquare, FiPlay,
  FiUser, FiCalendar, FiFilm, FiMonitor,
} from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import { MdMovieCreation } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import ReviewFormWrapper from "@/components/reviews/review-form-wrapper";
import MovieReviewList from "@/components/reviews/movie-review-list";
import WatchlistButton from "@/components/movies/watchlist-button";
import PremiumGate from "@/components/movies/premium-gate";
import ShareButton from "./share-button";
import type { ApiResponse, Media } from "@/types";

function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const embed = u.pathname.match(/\/embed\/([^/?]+)/);
      if (embed) return embed[1];
    }
  } catch { /* not a valid URL */ }
  return null;
}

async function getMedia(id: string): Promise<Media | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/movies/${id}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data: ApiResponse<Media> = await res.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const media = await getMedia(id);
  if (!media) return { title: "Not Found" };
  return {
    title: `${media.title} — CinePortal`,
    description: media.synopsis,
    openGraph: media.posterUrl ? { images: [{ url: media.posterUrl }] } : undefined,
  };
}

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const media = await getMedia(id);
  if (!media) notFound();

  const approvedReviews = media.reviews?.filter((r) => r.status === "APPROVED") ?? [];
  const allReviews      = media.reviews ?? [];
  const avgRating =
    approvedReviews.length > 0
      ? (approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length).toFixed(1)
      : null;
  const trailerYtId = media.trailerUrl ? extractYoutubeId(media.trailerUrl) : null;

  const overviewRows = [
    { label: "Title",       value: media.title },
    { label: "Type",        value: media.type === "MOVIE" ? "Movie" : "Series" },
    { label: "Release Year",value: String(media.releaseYear) },
    { label: "Genres",      value: media.genre.join(", ") || "—" },
    { label: "Director",    value: media.director || "—" },
    ...(media.cast.length > 0
      ? [{ label: "Cast", value: media.cast.slice(0, 4).join(", ") }]
      : []),
    ...(media.streamingPlatforms.length > 0
      ? [{ label: "Streaming", value: media.streamingPlatforms.join(", ") }]
      : []),
    { label: "Access",      value: media.pricing === "premium" ? "Premium" : "Free" },
  ];

  return (
    <div className="bg-background min-h-screen text-foreground">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Full-bleed blurred backdrop */}
        {media.posterUrl && (
          <>
            <Image
              src={media.posterUrl}
              alt=""
              fill
              className="object-cover object-[center_20%] opacity-50 blur-sm scale-105"
              priority
            />
            {/* Single gradient: transparent at top so backdrop is visible, fades to solid at bottom */}
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-black/30" />
          </>
        )}

        <div className="relative container mx-auto px-4 pt-10 pb-12">
          <div className="flex flex-col sm:flex-row gap-8 items-start">

            {/* ── Poster ── */}
            <div className="w-36 sm:w-44 md:w-52 shrink-0">
              <div className="relative rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10">
                {media.posterUrl ? (
                  <Image
                    src={media.posterUrl}
                    alt={media.title}
                    width={208}
                    height={312}
                    className="w-full object-cover"
                    priority
                  />
                ) : (
                  <div className="aspect-2/3 flex items-center justify-center bg-muted">
                    <MdMovieCreation className="w-14 h-14 opacity-20" />
                  </div>
                )}
              </div>
            </div>

            {/* ── Info ── */}
            <div className="flex-1 space-y-4 min-w-0">

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-primary text-primary-foreground text-[10px] font-black px-2.5 py-1 rounded tracking-widest uppercase">
                  {media.type === "MOVIE" ? "New Release" : "New Series"}
                </span>
                {media.pricing === "premium" && (
                  <span className="bg-amber-500 text-black text-[10px] font-black px-2.5 py-1 rounded tracking-widest uppercase">
                    Premium
                  </span>
                )}
                {avgRating && (
                  <span className="flex items-center gap-1 bg-black/60 border border-white/10 text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    <AiFillStar className="text-yellow-400 w-3.5 h-3.5" />
                    {avgRating}/5
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl xl:text-5xl font-black tracking-tight leading-tight">
                {media.title}
              </h1>

              {/* Genre subtitle in primary color */}
              {media.genre.length > 0 && (
                <p className="text-primary font-semibold text-sm md:text-base">
                  {media.genre.join(", ")}{" "}
                  {media.type === "MOVIE" ? "Full Movie" : "Series"}
                </p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5 text-primary" />
                  {media.releaseYear}
                </span>
                {media.genre.slice(0, 2).map((g) => (
                  <span key={g} className="flex items-center gap-1.5">
                    <FiFilm className="w-3.5 h-3.5 text-primary" />{g}
                  </span>
                ))}
                {media.director && (
                  <span className="flex items-center gap-1.5">
                    <FiUser className="w-3.5 h-3.5 text-primary" />{media.director}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <FiMessageSquare className="w-3.5 h-3.5 text-primary" />
                  {media._count.reviews} Reviews
                </span>
              </div>

              {/* Synopsis */}
              <p className="text-muted-foreground leading-relaxed text-sm max-w-2xl line-clamp-3">
                {media.synopsis}
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {media.streamingUrl ? (
                  <PremiumGate
                    streamingUrl={media.streamingUrl}
                    mediaTitle={media.title}
                    pricing={media.pricing}
                  />
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center gap-2 bg-primary/50 text-primary-foreground font-bold px-8 py-3 rounded-full cursor-not-allowed text-sm"
                  >
                    <FiPlay className="w-4 h-4 fill-current" /> Watch Now
                  </button>
                )}
                <WatchlistButton mediaId={media.id} />
                <ShareButton title={media.title} />
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ─────────────────────────────────────────────────── */}
      <div className="border-y border-border/40 bg-card/40 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap divide-x divide-border/40">

            {media._count.watchlist !== undefined && (
              <div className="flex items-center gap-3 py-4 px-6">
                <FiBookmark className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <p className="text-base font-black font-mono leading-none">
                    {(media._count.watchlist).toLocaleString()}+
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                    Watchlist
                  </p>
                </div>
              </div>
            )}

            {avgRating && (
              <div className="flex items-center gap-3 py-4 px-6">
                <AiFillStar className="w-5 h-5 text-yellow-400 shrink-0" />
                <div>
                  <p className="text-base font-black font-mono leading-none">{avgRating}/5</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                    CinePortal Rating
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 py-4 px-6">
              <FiMessageSquare className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <p className="text-base font-black font-mono leading-none">{media._count.reviews}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                  Reviews
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── TRAILER + OVERVIEW ────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">

          {/* Trailer */}
          <div className="lg:col-span-3">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 uppercase tracking-wide text-foreground/80">
              <FiPlay className="text-primary w-4 h-4" /> Trailer
            </h3>

            {trailerYtId ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${trailerYtId}?rel=0&modestbranding=1`}
                  title={`${media.title} — Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
                <span className="absolute top-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider pointer-events-none">
                  FULL HD
                </span>
              </div>
            ) : media.trailerUrl ? (
              <a
                href={media.trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center aspect-video rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors gap-3 text-muted-foreground"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <FiPlay className="w-8 h-8 text-primary fill-primary" />
                </div>
                <span className="font-semibold text-sm">Watch Trailer</span>
              </a>
            ) : (
              <div className="flex items-center justify-center aspect-video rounded-xl border border-border/40 bg-muted/10 text-muted-foreground text-sm">
                No trailer available
              </div>
            )}
          </div>

          {/* Overview table */}
          <div className="lg:col-span-2">
            <h3 className="text-base font-bold mb-4 uppercase tracking-wide text-foreground/80">
              Overview
            </h3>
            <div className="rounded-xl border border-border/40 overflow-hidden divide-y divide-border/30">
              {overviewRows.map(({ label, value }) => (
                <div key={label} className="grid grid-cols-[110px_1fr] text-sm">
                  <span className="py-2.5 px-4 font-semibold text-muted-foreground bg-muted/10 truncate">
                    {label}
                  </span>
                  <span className="py-2.5 px-4 text-foreground wrap-break-word">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── FEATURE BADGES (streaming platforms + highlights) ─────── */}
        {(media.streamingPlatforms.length > 0 || media.cast.length > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-10">

            {/* Media type badge */}
            <div className="flex items-center gap-3 bg-card/50 border border-border/40 rounded-xl px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <FiFilm className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{media.type === "MOVIE" ? "Full Movie" : "Full Series"}</p>
                <p className="text-[10px] text-muted-foreground">{media.type === "MOVIE" ? "Watch Now" : "All Episodes"}</p>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-center gap-3 bg-card/50 border border-border/40 rounded-xl px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <AiFillStar className="w-4 h-4 text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{media.pricing === "premium" ? "Premium" : "Free Access"}</p>
                <p className="text-[10px] text-muted-foreground">{media.pricing === "premium" ? "Subscribe Now" : "No Cost"}</p>
              </div>
            </div>

            {/* Streaming platforms */}
            {media.streamingPlatforms.slice(0, 3).map((p) => (
              <div key={p} className="flex items-center gap-3 bg-card/50 border border-border/40 rounded-xl px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <FiMonitor className="w-4 h-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{p}</p>
                  <p className="text-[10px] text-muted-foreground">Available</p>
                </div>
              </div>
            ))}

          </div>
        )}

        {/* ── CAST ──────────────────────────────────────────────────── */}
        {media.cast.length > 0 && (
          <div className="mb-10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <FiUser className="w-3.5 h-3.5 text-primary" /> Key Cast
            </h3>
            <div className="flex flex-wrap gap-2">
              {media.cast.map((actor) => (
                <span
                  key={actor}
                  className="bg-secondary/60 border border-white/5 px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {actor}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── GENRES ─────────────────────────────────────────────── */}
        {media.genre.length > 0 && (
          <div className="mb-10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <FiFilm className="w-3.5 h-3.5 text-primary" /> Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              {media.genre.map((g) => (
                <Link key={g} href={`/movies?genre=${g}`}>
                  <Badge variant="secondary" className="text-sm px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                    {g}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── COMMUNITY REVIEWS ─────────────────────────────────────── */}
        <section id="reviews">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <AiFillStar className="text-yellow-400 w-5 h-5 shrink-0" />
              <h2 className="text-xl font-bold">Community Reviews</h2>
              {avgRating && (
                <span className="text-lg text-muted-foreground font-normal">
                  {avgRating}/5{" "}
                  <span className="text-sm">({approvedReviews.length} reviews)</span>
                </span>
              )}
            </div>
          </div>

          <div className="bg-card/30 rounded-2xl border border-border/40 p-5 mb-8">
            <ReviewFormWrapper mediaId={media.id} pricing={media.pricing} />
          </div>

          <MovieReviewList initialReviews={allReviews} mediaId={media.id} />
        </section>
      </div>

      {/* ── STICKY WATCHLIST CTA ──────────────────────────────────────── */}
      <div className="sticky bottom-0 z-40 border-t border-border/40 bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎬</span>
            <div>
              <p className="text-sm font-bold">Love this movie?</p>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Add to your watchlist and never miss an update!
              </p>
            </div>
          </div>
          <WatchlistButton mediaId={media.id} />
        </div>
      </div>

    </div>
  );
}
