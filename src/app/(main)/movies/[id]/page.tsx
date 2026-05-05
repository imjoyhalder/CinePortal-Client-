import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FiCalendar, FiUser, FiMonitor, FiMessageSquare, FiExternalLink,
} from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import { MdMovieCreation } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ReviewFormWrapper from "@/components/reviews/review-form-wrapper";
import MovieReviewList from "@/components/reviews/movie-review-list";
import WatchlistButton from "@/components/movies/watchlist-button";
import PremiumGate from "@/components/movies/premium-gate";
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
  const allReviews = media.reviews ?? [];
  const avgRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
    : null;
  const trailerYtId = media.trailerUrl ? extractYoutubeId(media.trailerUrl) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Hero backdrop ──────────────────────────────────────────────────── */}
      <div className="relative h-[55vh] w-full overflow-hidden">
        {media.posterUrl ? (
          <>
            <Image
              src={media.posterUrl}
              alt={media.title}
              fill
              className="object-cover object-[center_20%] scale-105 blur-sm opacity-35"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/75 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-muted/20" />
        )}
      </div>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 mt-[-28vh] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Poster — desktop only */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-24">
              <div className="aspect-2/3 relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 hover:scale-[1.02] transition-transform duration-500">
                {media.posterUrl ? (
                  <Image src={media.posterUrl} alt={media.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                    <MdMovieCreation className="w-20 h-20 opacity-20" />
                  </div>
                )}
              </div>
              <div className="mt-5">
                <WatchlistButton mediaId={media.id} />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-9 space-y-7">
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3">
                  {media.type === "MOVIE" ? "Movie" : "Series"}
                </Badge>
                {media.pricing === "premium" && (
                  <Badge className="bg-amber-500 text-black font-bold text-xs">PREMIUM</Badge>
                )}
                {avgRating && (
                  <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-full px-3 py-1 backdrop-blur-sm">
                    <AiFillStar className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-sm font-bold">{avgRating}/10</span>
                  </div>
                )}
                <span className="text-sm text-muted-foreground">
                  {approvedReviews.length} review{approvedReviews.length !== 1 ? "s" : ""}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {media.title}
              </h1>

              <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5"><FiCalendar className="text-primary w-3.5 h-3.5" /> {media.releaseYear}</span>
                <span className="flex items-center gap-1.5"><FiUser className="text-primary w-3.5 h-3.5" /> {media.director}</span>
                <span className="flex items-center gap-1.5"><FiMessageSquare className="text-primary w-3.5 h-3.5" /> {media._count.reviews} Reviews</span>
              </div>
            </header>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {media.genre.map((g) => (
                <Link key={g} href={`/movies?genre=${g}`}>
                  <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                    {g}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Synopsis */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Synopsis</h3>
              <p className="text-muted-foreground leading-relaxed max-w-2xl">
                {media.synopsis}
              </p>
            </div>

            {/* Platforms + Cast */}
            {(media.streamingPlatforms.length > 0 || media.cast.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-6">
                {media.streamingPlatforms.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 mb-2">
                      <FiMonitor className="w-3.5 h-3.5" /> Streaming On
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {media.streamingPlatforms.map((p) => (
                        <span key={p} className="bg-secondary/60 px-3 py-1 rounded-md text-xs font-semibold border border-white/5">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                {media.cast.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Key Cast</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{media.cast.join(" · ")}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-5 pt-1">
              {/* Mobile watchlist */}
              <div className="lg:hidden">
                <WatchlistButton mediaId={media.id} />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {media.streamingUrl ? (
                  <PremiumGate
                    streamingUrl={media.streamingUrl}
                    mediaTitle={media.title}
                    pricing={media.pricing}
                  />
                ) : null}

                {media.trailerUrl && !trailerYtId && (
                  <Button variant="outline" className="gap-2 rounded-full" asChild>
                    <a href={media.trailerUrl} target="_blank" rel="noopener noreferrer">
                      <FiExternalLink className="w-4 h-4" /> Watch Trailer
                    </a>
                  </Button>
                )}
              </div>

              {/* YouTube trailer */}
              {trailerYtId && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Official Trailer</h3>
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl max-w-2xl">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${trailerYtId}?rel=0&modestbranding=1`}
                      title={`${media.title} — Trailer`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-16 bg-linear-to-r from-transparent via-border to-transparent" />

        {/* ── Reviews ──────────────────────────────────────────────────────── */}
        <section id="reviews" className="max-w-4xl mx-auto pb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Community Reviews</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                What people are saying about {media.title}
              </p>
            </div>
            {avgRating && (
              <div className="text-right hidden sm:block">
                <div className="text-3xl font-bold text-primary">{avgRating}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">avg / 10</div>
              </div>
            )}
          </div>

          <div className="bg-card/50 p-5 rounded-2xl border border-border/30 mb-10">
            <ReviewFormWrapper mediaId={media.id} />
          </div>

          <MovieReviewList initialReviews={allReviews} mediaId={media.id} />
        </section>
      </div>
    </div>
  );
}
