"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import MovieCard, { MovieCardSkeleton } from "@/components/movies/movie-card";
import { api } from "@/lib/api";
import type { ApiResponse, Media } from "@/types";

const GENRES = ["Action", "Drama", "Comedy", "Thriller", "Horror", "Sci-Fi", "Romance", "Documentary", "Animation", "Fantasy"];
const PLATFORMS = ["Netflix", "Disney+", "Prime Video", "Apple TV+", "HBO Max", "Hulu"];

export default function MoviesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Sync filter state → URL so links are shareable and back button works
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

  const hasFilters = search || type || genre || platform || pricing || sortBy;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Browse Movies &amp; Series</h1>
        <p className="text-muted-foreground">
          {loading ? "Loading..." : `${total} titles available`}
        </p>
      </div>

      {/* Search + Filters bar */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search titles, directors, cast..."
              className="pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 shrink-0"
          >
            <FiFilter className="w-4 h-4" />
            Filters
            {hasFilters && <Badge className="ml-1 bg-primary/20 text-primary text-xs py-0 px-1.5">ON</Badge>}
          </Button>
          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <FiX className="w-4 h-4" />
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-4 bg-card rounded-xl border border-border/50">
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

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => <MovieCardSkeleton key={i} />)}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-muted-foreground text-lg">No movies found.</p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((m) => <MovieCard key={m.id} media={m} />)}
        </div>
      )}

      {/* Pagination */}
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
