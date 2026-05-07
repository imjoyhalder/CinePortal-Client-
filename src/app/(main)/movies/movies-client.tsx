"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiX, FiChevronDown, FiFilter, FiFilm } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MovieCard, { MovieCardSkeleton } from "@/components/movies/movie-card";
import type { Media } from "@/types";

// ── types ──────────────────────────────────────────────────────────────────

interface Filters {
  search: string;
  type: string;
  genre: string;
  platform: string;
  pricing: string;
  sortBy: string;
}

interface MoviesClientProps {
  movies: Media[];
  total: number;
  totalPages: number;
  currentPage: number;
  filters: Filters;
}

// ── constants ───────────────────────────────────────────────────────────────

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Sci-Fi",
  "Thriller", "Horror", "Romance", "Documentary", "Animation",
];
const PLATFORMS = [
  "Netflix", "Disney+", "Prime Video", "Apple TV+", "HBO Max", "Hulu",
];
const SORT_OPTIONS = [
  { value: "",             label: "Newest First"  },
  { value: "mostReviewed", label: "Most Reviewed" },
  { value: "topRated",     label: "Top Rated"     },
];

// ── helpers ─────────────────────────────────────────────────────────────────

function buildQuery(f: Filters, page: number): string {
  const p = new URLSearchParams();
  if (f.search)   p.set("search",            f.search);
  if (f.type)     p.set("type",              f.type);
  if (f.genre)    p.set("genre",             f.genre);
  if (f.platform) p.set("streamingPlatform", f.platform);
  if (f.pricing)  p.set("pricing",           f.pricing);
  if (f.sortBy)   p.set("sortBy",            f.sortBy);
  if (page > 1)   p.set("page",              String(page));
  return p.toString();
}

// ── component ───────────────────────────────────────────────────────────────

export default function MoviesClient({
  movies,
  total,
  totalPages,
  currentPage,
  filters,
}: MoviesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Local state only for the search text input (needs debounce)
  const [searchInput, setSearchInput] = useState(filters.search);

  // Sync search input when the server re-renders with new filters (back/forward)
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // Debounce: push URL 400 ms after the user stops typing
  useEffect(() => {
    if (searchInput === filters.search) return;
    const id = setTimeout(() => {
      const q = buildQuery({ ...filters, search: searchInput }, 1);
      startTransition(() => {
        router.push(`/movies${q ? `?${q}` : ""}`, { scroll: false });
      });
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Apply a filter change — all filtering/sorting/pagination done by the server
  function applyFilter(change: Partial<Filters>, page = 1) {
    const merged = { ...filters, ...change };
    const q = buildQuery(merged, page);
    startTransition(() => {
      router.push(`/movies${q ? `?${q}` : ""}`, { scroll: false });
    });
  }

  function clearAll() {
    setSearchInput("");
    startTransition(() => {
      router.push("/movies", { scroll: false });
    });
  }

  const activeFilterCount = [
    filters.type, filters.genre, filters.platform, filters.pricing, filters.sortBy,
  ].filter(Boolean).length;

  const filterBtn = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-background border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
    }`;

  return (
    <div className="container mx-auto px-4 py-8 md:py-10">

      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-1">Browse Movies &amp; Series</h1>
        <p className="text-muted-foreground">
          {total > 0
            ? `${total.toLocaleString()} titles available`
            : "Discover and explore movies and TV shows"}
        </p>
      </div>

      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <div className="mb-6 space-y-3">

        {/* Search + toggle row */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search titles, directors, cast…"
              className="pl-10 h-10 bg-card border-border/60 focus-visible:border-primary"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => { setSearchInput(""); applyFilter({ search: "" }); }}
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button
            variant={filtersOpen ? "default" : "outline"}
            size="sm"
            className="h-10 px-4 gap-2 shrink-0"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <FiFilter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-primary-foreground text-primary text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {activeFilterCount}
              </span>
            )}
            <FiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`} />
          </Button>

          {(activeFilterCount > 0 || filters.search) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 px-3 gap-1.5 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={clearAll}
            >
              <FiX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear all</span>
            </Button>
          )}
        </div>

        {/* Expanded filter panel */}
        {filtersOpen && (
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <fieldset>
                <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Type</legend>
                <div className="flex flex-wrap gap-2">
                  {[
                    { v: "",       label: "All"     },
                    { v: "MOVIE",  label: "Movies"  },
                    { v: "SERIES", label: "Series"  },
                  ].map(({ v, label }) => (
                    <button key={v} onClick={() => applyFilter({ type: v })} className={filterBtn(filters.type === v)}>
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pricing</legend>
                <div className="flex flex-wrap gap-2">
                  {[
                    { v: "",        label: "All"     },
                    { v: "free",    label: "Free"    },
                    { v: "premium", label: "Premium" },
                  ].map(({ v, label }) => (
                    <button key={v} onClick={() => applyFilter({ pricing: v })} className={filterBtn(filters.pricing === v)}>
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sort By</legend>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <button key={value} onClick={() => applyFilter({ sortBy: value })} className={filterBtn(filters.sortBy === value)}>
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            <fieldset>
              <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Genre</legend>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => applyFilter({ genre: "" })} className={filterBtn(!filters.genre)}>All</button>
                {GENRES.map((g) => (
                  <button key={g} onClick={() => applyFilter({ genre: filters.genre === g ? "" : g })} className={filterBtn(filters.genre === g)}>
                    {g}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Platform</legend>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => applyFilter({ platform: "" })} className={filterBtn(!filters.platform)}>All</button>
                {PLATFORMS.map((p) => (
                  <button key={p} onClick={() => applyFilter({ platform: filters.platform === p ? "" : p })} className={filterBtn(filters.platform === p)}>
                    {p}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Active:</span>

            {filters.type && (
              <Badge variant="secondary" className="gap-1.5 pr-1.5 text-xs cursor-pointer hover:bg-destructive/15 hover:text-destructive" onClick={() => applyFilter({ type: "" })}>
                {filters.type === "MOVIE" ? "Movies" : "Series"} <FiX className="w-3 h-3" />
              </Badge>
            )}
            {filters.genre && (
              <Badge variant="secondary" className="gap-1.5 pr-1.5 text-xs cursor-pointer hover:bg-destructive/15 hover:text-destructive" onClick={() => applyFilter({ genre: "" })}>
                {filters.genre} <FiX className="w-3 h-3" />
              </Badge>
            )}
            {filters.platform && (
              <Badge variant="secondary" className="gap-1.5 pr-1.5 text-xs cursor-pointer hover:bg-destructive/15 hover:text-destructive" onClick={() => applyFilter({ platform: "" })}>
                {filters.platform} <FiX className="w-3 h-3" />
              </Badge>
            )}
            {filters.pricing && (
              <Badge variant="secondary" className="gap-1.5 pr-1.5 text-xs cursor-pointer hover:bg-destructive/15 hover:text-destructive" onClick={() => applyFilter({ pricing: "" })}>
                {filters.pricing === "premium" ? "Premium" : "Free"} <FiX className="w-3 h-3" />
              </Badge>
            )}
            {filters.sortBy && (
              <Badge variant="secondary" className="gap-1.5 pr-1.5 text-xs cursor-pointer hover:bg-destructive/15 hover:text-destructive" onClick={() => applyFilter({ sortBy: "" })}>
                {SORT_OPTIONS.find((s) => s.value === filters.sortBy)?.label} <FiX className="w-3 h-3" />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {isPending ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => <MovieCardSkeleton key={i} />)}
        </div>
      ) : movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
            <FiFilm className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">No titles found</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
          </div>
          <Button variant="outline" onClick={clearAll} className="gap-2">
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

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1 || isPending}
            onClick={() => applyFilter({}, currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages || isPending}
            onClick={() => applyFilter({}, currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
