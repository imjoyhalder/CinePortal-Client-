import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiCalendar, FiUser, FiMonitor, FiMessageSquare, FiPlay, FiPlus } from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import { MdMovieCreation } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ReviewCard from "@/components/reviews/review-card";
import ReviewFormWrapper from "@/components/reviews/review-form-wrapper";
import WatchlistButton from "@/components/movies/watchlist-button";
import type { ApiResponse, Media } from "@/types";

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
    title: media.title,
    description: media.synopsis,
  };
}

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const media = await getMedia(id);
  if (!media) notFound();

  const avgRating =
    media.reviews && media.reviews.length > 0
      ? (media.reviews.reduce((sum, r) => sum + r.rating, 0) / media.reviews.length).toFixed(1)
      : null;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-72 bg-muted overflow-hidden">
        {media.posterUrl ? (
          <Image
            src={media.posterUrl}
            alt={media.title}
            fill
            className="object-cover object-top"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <MdMovieCreation className="w-32 h-32 text-muted-foreground/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster (desktop) */}
          <div className="hidden lg:block">
            <div className="relative aspect-2/3 rounded-xl overflow-hidden shadow-2xl border border-border/20">
              {media.posterUrl ? (
                <Image src={media.posterUrl} alt={media.title} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <MdMovieCreation className="w-20 h-20 text-muted-foreground/30" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary">{media.type === "MOVIE" ? "Movie" : "Series"}</Badge>
                <Badge className={media.pricing === "premium" ? "bg-primary text-primary-foreground" : ""}>
                  {media.pricing === "premium" ? "Premium" : "Free"}
                </Badge>
                {avgRating && (
                  <div className="flex items-center gap-1 bg-primary/10 rounded-full px-3 py-0.5">
                    <AiFillStar className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-bold text-primary">{avgRating}/10</span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold mb-2">{media.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="w-4 h-4" /> {media.releaseYear}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiUser className="w-4 h-4" /> {media.director}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiMessageSquare className="w-4 h-4" /> {media._count.reviews} reviews
                </span>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {media.genre.map((g) => (
                <Badge key={g} variant="outline" className="text-xs">
                  <Link href={`/movies?genre=${g}`}>{g}</Link>
                </Badge>
              ))}
            </div>

            <p className="text-muted-foreground leading-relaxed">{media.synopsis}</p>

            {/* Cast */}
            {media.cast.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cast</h3>
                <p className="text-sm">{media.cast.join(", ")}</p>
              </div>
            )}

            {/* Platforms */}
            {media.streamingPlatforms.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FiMonitor className="w-3.5 h-3.5" /> Available On
                </h3>
                <div className="flex flex-wrap gap-2">
                  {media.streamingPlatforms.map((p) => (
                    <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {media.streamingUrl && (
                <Button className="gap-2" asChild>
                  <a href={media.streamingUrl} target="_blank" rel="noopener noreferrer">
                    <FiPlay className="w-4 h-4" /> Watch Now
                  </a>
                </Button>
              )}
              {media.trailerUrl && (
                <Button variant="outline" className="gap-2" asChild>
                  <a href={media.trailerUrl} target="_blank" rel="noopener noreferrer">
                    <FiPlay className="w-4 h-4" /> Trailer
                  </a>
                </Button>
              )}
              <WatchlistButton mediaId={media.id} />
            </div>
          </div>
        </div>

        <Separator className="my-12 opacity-20" />

        {/* Reviews section */}
        <div id="reviews" className="space-y-8 pb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Reviews</h2>
            <span className="text-sm text-muted-foreground">{media._count.reviews} total</span>
          </div>

          <ReviewFormWrapper mediaId={media.id} />

          {media.reviews && media.reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {media.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FiMessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No reviews yet. Be the first to review!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
