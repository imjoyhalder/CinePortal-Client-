import Image from "next/image";
import Link from "next/link";
import { FiStar, FiMessageSquare } from "react-icons/fi";
import { MdMovieCreation, MdTv } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Media } from "@/types";

interface MovieCardProps {
  media: Media;
}

export default function MovieCard({ media }: MovieCardProps) {
  return (
    <Link href={`/movies/${media.id}`}>
      <Card className="group overflow-hidden card-hover cursor-pointer border-border/50 bg-card h-full">
        <div className="relative aspect-2/3 overflow-hidden bg-muted">
          {media.posterUrl ? (
            <Image
              src={media.posterUrl}
              alt={media.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              {media.type === "MOVIE" ? (
                <MdMovieCreation className="w-16 h-16 text-muted-foreground/30" />
              ) : (
                <MdTv className="w-16 h-16 text-muted-foreground/30" />
              )}
            </div>
          )}

          {/* Overlay badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge
              className={`text-xs font-medium ${
                media.pricing === "premium"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {media.pricing === "premium" ? "Premium" : "Free"}
            </Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              {media.type === "MOVIE" ? "Movie" : "Series"}
            </Badge>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/80 to-transparent" />

          {/* Stats at bottom */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs text-white">
            <span className="flex items-center gap-1">
              <FiMessageSquare className="w-3 h-3" />
              {media._count.reviews}
            </span>
            <span>{media.releaseYear}</span>
          </div>
        </div>

        <CardContent className="p-3">
          <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {media.title}
          </h3>
          {media.genre.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {media.genre.slice(0, 2).join(" · ")}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function MovieCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50">
      <div className="aspect-2/3 bg-muted animate-pulse" />
      <CardContent className="p-3">
        <div className="h-4 bg-muted rounded animate-pulse mb-2" />
        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
      </CardContent>
    </Card>
  );
}
