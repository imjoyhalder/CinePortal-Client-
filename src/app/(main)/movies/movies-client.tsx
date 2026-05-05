"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiSearch, FiX, FiChevronDown, FiFilter } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MovieCard, { MovieCardSkeleton } from "@/components/movies/movie-card";
import { api } from "@/lib/api";
import type { ApiResponse, Media } from "@/types";

const GENRES    = ["Action", "Adventure", "Comedy", "Drama", "Sci-Fi", "Thriller", "Horror", "Romance", "Documentary", "Animation"];
const PLATFORMS = ["Netflix", "Disney+", "Prime Video", "Apple TV+", "HBO Max", "Hulu"];

const SORT_OPTIONS = [
  { value: "",             label: "Newest First"   },
  { value: "mostReviewed", label: "Most Reviewed"  },
  { value: "topRated",     label: "Top Rated"       },
];

export default function MoviesClient() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [movies,  setMovies]  = useState<Media[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search,   setSearch]   = useState(searchParams.get("search")            || "");
  const [type,     setType]     = useState(searchParams.get("type")               || "");
  const [genre,    setGenre]    = useState(searchParams.get("genre")              || "");
  const [platform, setPlatform] = useState(searchParams.get("streamingPlatform") || "");
  const [pricing,  setPricing]  = useState(searchParams.get("pricing")            || "");
  const [sortBy,   setSortBy]   = useState(searchParams.get("sortBy")             || "");

  const LIMIT = 18;

  const buildQuery = useCallback(() => {
    const p = new URLSearchParams();
    if (search)   p.set("search",           search);
    if (type)     p.set("type",             type);
    if (genre)    p.set("genre",            genre);
    if (platform) p.set("streamingPlatform", platform);
    if (pricing)  p.set("pricing",          pricing);
    if (sortBy)   p.set("sortBy",           sortBy);
    p.set("page",  String(page));
    p.set("limit", String(LIMIT));
    return p.toString();
  }, [search, type, genre, platform, pricing, sortBy, page]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const d = await api.get<ApiResponse<Media[]>>(`/movies?${buildQuery()}`);
        if (!cancelled) { setMovies(d.data ?? []); setTotal(d.meta?.total ?? 0); }
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
    const p = new URLSearchParams();
    if (search)   p.set("search",            search);
    if (type)     p.set("type",              type);
    if (genre)    p.set("genre",             genre);
    if (platform) p.set("streamingPlatform", platform);
    if (pricing)  p.set("pricing",           pricing);
    if (sortBy)   p.set("sortBy",            sortBy);
    if (page > 1) p.set("page",              String(page));
    router.replace(`/movies${p.toString() ? `?${p.toString()}` : ""}`, { scroll: false });
  }, [search, type, genre, platform, pricing, sortBy, page, router]);

  function clearFilters() {
    setSearch(""); setType(""); setGenre(""); setPlatform(""); setPricing(""); setSortBy(""); setPage(1);
  }

  function removeFilter(key: "type" | "genre" | "platform" | "pricing" | "sortBy") {
    if (key === "type")     { setType(""); setPage(1); }
    if (key === "genre")    { setGenre(""); setPage(1); }
    if (key === "platform") { setPlatform(""); setPage(1); }
    if (key === "pricing")  { setPricing(""); setPage(1); }
    if (key === "sortBy")   { setSortBy(""); setPage(1); }
  }

  const totalPages      = Math.ceil(total / LIMIT);
  const activeFilters   = [
    type     && { key: "type"     as const, label: type === "MOVIE" ? "Movies" : "Series" },
    genre    && { key: "genre"    as const, label: genre },
    platform && { key: "platform" as const, label: platform },
    pricing  && { key: "pricing"  as const, label: pricing === "premium" ? "Premium" : "Free" },
    sortBy   && { key: "sortBy"   as const, label: SORT_OPTIONS.find(s => s.value === sortBy)?.label ?? sortBy },
  ].filter(Boolean) as { key: "type" | "genre" | "platform" | "pricing" | "sortBy"; label: string }[];

  return (
    <div className="container mx-auto px-4 py-8 md:py-10">

      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-1">Browse Movies &amp; Series</h1>
        <p className="text-muted-foreground">
          {total > 0 ? `${total.toLocaleString()} titles available` : "Discover and explore movies and TV shows"}
        </p>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div className="mb-6 space-y-3">

        {/* Search + controls row */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search titles, directors, cast…"
              className="pl-10 h-10 bg-card border-border/60 focus-visible:border-primary"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => { setSearch(""); setPage(1); }}
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button
            variant={filtersOpen ? "default" : "outline"}
            size="sm"
            className="h-10 px-4 gap-2 shrink-0"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <FiFilter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilters.length > 0 && (
              <span className="bg-primary-foreground text-primary text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {activeFilters.length}
              </span>
            )}
            <FiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`} />
          </Button>

          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 px-3 gap-1.5 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={clearFilters}
            >
              <FiX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear all</span>
            </Button>
          )}
        </div>

        {/* Expanded filter panel */}
        {filtersOpen && (
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">

            {/* Row 1: Type + Genre + Platform */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <fieldset>
                <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Type</legend>
                <div className="flex flex-wrap gap-2">
                  {[{ v: "", label: "All" }, { v: "MOVIE", label: "Movies" }, { v: "SERIES", label: "Series" }].map(({ v, label }) => (
                    <button
                      key={v}
                      onClick={() => { setType(v); setPage(1); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        type === v
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pricing</legend>
                <div className="flex flex-wrap gap-2">
                  {[{ v: "", label: "All" }, { v: "free", label: "Free" }, { v: "premium", label: "Premium" }].map(({ v, label }) => (
                    <button
                      key={v}
                      onClick={() => { setPricing(v); setPage(1); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        pricing === v
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sort By</legend>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { setSortBy(value); setPage(1); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        sortBy === value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Row 2: Genres */}
            <fieldset>
              <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Genre</legend>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setGenre(""); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    genre === ""
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  All
                </button>
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => { setGenre(genre === g ? "" : g); setPage(1); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      genre === g
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Row 3: Platforms */}
            <fieldset>
              <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Platform</legend>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setPlatform(""); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    platform === ""
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  All
                </button>
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPlatform(platform === p ? "" : p); setPage(1); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      platform === p
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Active:</span>
            {activeFilters.map(({ key, label }) => (
              <Badge
                key={key}
                variant="secondary"
                className="gap-1.5 pr-1.5 text-xs cursor-pointer hover:bg-destructive/15 hover:text-destructive transition-colors"
                onClick={() => removeFilter(key)}
              >
                {label}
                <FiX className="w-3 h-3" />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => <MovieCardSkeleton key={i} />)}
        </div>
      ) : movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center text-4xl">🎬</div>
          <div>
            <h3 className="text-xl font-bold mb-1">No titles found</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
          </div>
          <Button variant="outline" onClick={clearFilters} className="gap-2">
            <FiX className="w-4 h-4" /> Clear filters
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Showing {movies.length} of {total.toLocaleString()} result{total !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((m) => <MovieCard key={m.id} media={m} />)}
          </div>
        </>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
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
