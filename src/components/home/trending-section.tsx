"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";
import { MdMovieCreation } from "react-icons/md";
import type { Media } from "@/types";

interface TrendingSectionProps {
  movies: Media[];
  title: string;
}

export default function TrendingSection({ movies, title }: TrendingSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  }

  if (!movies.length) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{title}</h2>
          <div className="flex items-center gap-3">
            <Link href="/movies" className="text-sm text-primary hover:underline font-medium mr-1">
              View All
            </Link>
            <button
              onClick={() => scroll("left")}
              className="w-8 h-8 rounded-full border border-border/50 bg-card flex items-center justify-center hover:border-primary/50 hover:text-primary transition-colors"
              aria-label="Scroll left"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-8 h-8 rounded-full border border-border/50 bg-card flex items-center justify-center hover:border-primary/50 hover:text-primary transition-colors"
              aria-label="Scroll right"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scroll track */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-1"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movies/${movie.id}`}
              className="shrink-0 w-40 group"
              style={{ scrollSnapAlign: "start" }}
            >
              {/* Poster */}
              <div className="relative aspect-2/3 rounded-xl overflow-hidden bg-muted mb-2.5 ring-1 ring-white/5">
                {movie.posterUrl ? (
                  <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="160px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MdMovieCreation className="w-10 h-10 text-muted-foreground/25" />
                  </div>
                )}

                {/* Rating badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                  <FiStar className="w-3 h-3 text-primary fill-primary" />
                  <span className="text-xs font-bold text-white leading-none">
                    {movie._count?.reviews
                      ? Math.min(9.9, 6.5 + (movie._count.reviews / 50)).toFixed(1)
                      : "—"}
                  </span>
                </div>

                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
              </div>

              {/* Info */}
              <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors leading-tight">
                {movie.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {movie.type === "SERIES" ? "TV Series" : "Movie"} &bull; {movie.releaseYear}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
