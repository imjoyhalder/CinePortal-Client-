"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiSearch, FiFilter, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MovieCard, { MovieCardSkeleton } from "@/components/movies/movie-card";
import { api } from "@/lib/api";
import type { ApiResponse, Media } from "@/types";

const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Sci-Fi", "Thriller", "Horror", "Romance", "Documentary", "Animation"];
const PLATFORMS = ["Netflix", "Disney+", "Prime Video", "Apple TV+", "HBO Max", "Hulu"];

const GENRE_EMOJIS: Record<string, string> = {
  Action: "🔥",
  Adventure: "🌍",
  Comedy: "😂",
  Drama: "🎭",
  "Sci-Fi": "🚀",
  Thriller: "🎯",
  Horror: "👻",
  Romance: "❤️",
  Documentary: "🎬",
  Animation: "✨",
};

export default function MoviesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const genreScrollRef = useRef<HTMLDivElement>(null);

  const [movies, setMovies] = useState<Media[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [genre, setGenre] = useState(searchParams.get("genre") || "");
  const [platform, setPlatform] = useState(searchParams.get("streamingPlatform") || "");
  const [pricing, setPricing] = useState(searchParams.get("pricing") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");
  const [showFilters, setShowFilters] = useState(false);

  const LIMIT = 18;

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    if (genre) params.set("genre", genre);
    if (platform) params.set("streamingPlatform", platform);
    if (pricing) params.set("pricing", pricing);
    if (sortBy) params.set("sortBy", sortBy);
    params.set("page", String(page));
    params.set("limit", String(LIMIT));
    return params.toString();
  }, [search, type, genre, platform, pricing, sortBy, page]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await api.get<ApiResponse<Media[]>>(`/movies?${buildQuery()}`);
        if (!cancelled) {
          setMovies(data.data ?? []);
          setTotal(data.meta?.total ?? 0);
        }
      } catch {
        if (!cancelled) setMovies([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [buildQuery]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    if (genre) params.set("genre", genre);
    if (platform) params.set("streamingPlatform", platform);
    if (pricing) params.set("pricing", pricing);
    if (sortBy) params.set("sortBy", sortBy);
    if (page > 1) params.set("page", String(page));
    router.replace(`/movies${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }, [search, type, genre, platform, pricing, sortBy, page, router]);

  function clearFilters() {
    setSearch(""); setType(""); setGenre(""); setPlatform(""); setPricing(""); setSortBy(""); setPage(1);
  }

  const hasFilters = !!(search || type || genre || platform || pricing || sortBy);

  const activeFilterCount = [search, type, genre, platform, pricing, sortBy].filter(Boolean).length;

  const totalPages = Math.ceil(total / LIMIT);

  function scrollGenres(direction: "left" | "right") {
    if (!genreScrollRef.current) return;
    genreScrollRef.current.scrollBy({ left: direction === "left" ? -240 : 240, behavior: "smooth" });
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Browse Movies &amp; Series</h1>
        <p className="text-muted-foreground text-lg">
          Discover and explore thousands of movies and TV shows.
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search titles, directors, cast..."
              className="pl-12 h-12 text-base bg-card border-border/60 focus-visible:border-primary"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 px-5 gap-2 shrink-0 relative"
          >
            <FiFilter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold leading-none">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {hasFilters && (
            <Button variant="ghost" className="h-12 px-4 shrink-0 text-muted-foreground hover:text-foreground gap-2" onClick={clearFilters}>
              <FiX className="w-4 h-4" />
              Clear all
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-4 bg-card rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
            <Select value={type} onValueChange={(v) => { setType(!v || v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="MOVIE">Movies</SelectItem>
                <SelectItem value="SERIES">Series</SelectItem>
              </SelectContent>
            </Select>

            <Select value={genre} onValueChange={(v) => { setGenre(!v || v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Genre" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={platform} onValueChange={(v) => { setPlatform(!v || v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Platform" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={pricing} onValueChange={(v) => { setPricing(!v || v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Pricing" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => { setSortBy(!v || v === "default" ? "" : v); setPage(1); }}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Newest First</SelectItem>
                <SelectItem value="mostReviewed">Most Reviewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="mb-10">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Popular Genres</h2>
        <div className="relative flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full w-8 h-8 border-border/60"
            onClick={() => scrollGenres("left")}
          >
            <FiChevronLeft className="w-4 h-4" />
          </Button>

          <div
            ref={genreScrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
          >
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => { setGenre(genre === g ? "" : g); setShowFilters(false); setPage(1); }}
                className={`flex flex-col items-center gap-1.5 shrink-0 rounded-2xl px-5 py-3 border transition-all duration-150 cursor-pointer ${
                  genre === g
                    ? "bg-primary/15 border-primary text-primary"
                    : "bg-card border-border/50 text-foreground hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <span className="text-2xl leading-none">{GENRE_EMOJIS[g] ?? "🎬"}</span>
                <span className="text-xs font-medium whitespace-nowrap">{g}</span>
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full w-8 h-8 border-border/60"
            onClick={() => scrollGenres("right")}
          >
            <FiChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => <MovieCardSkeleton key={i} />)}
        </div>
      ) : movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-6xl">
            🎬
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">No movies found.</h3>
            <p className="text-muted-foreground max-w-sm">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
          </div>
          <Button onClick={clearFilters} className="gap-2">
            <FiFilter className="w-4 h-4" />
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((m) => <MovieCard key={m.id} media={m} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
