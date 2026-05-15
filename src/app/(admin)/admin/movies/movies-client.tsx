"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff,
  FiSearch, FiChevronUp, FiChevronDown, FiX,
} from "react-icons/fi";
import { MdMovieCreation } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { ApiResponse, Media } from "@/types";
import AdminMovieForm from "@/components/admin/admin-movie-form";

// ── Types ─────────────────────────────────────────────────────────────────────

type SortField = "title" | "year" | "reviews" | "createdAt";
type SortOrder = "asc" | "desc";

// ── Helpers ───────────────────────────────────────────────────────────────────

function SortIcon({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) return (
    <span className="flex flex-col opacity-40">
      <FiChevronUp className="w-2.5 h-2.5 -mb-0.5" />
      <FiChevronDown className="w-2.5 h-2.5" />
    </span>
  );
  return order === "asc"
    ? <FiChevronUp className="w-3.5 h-3.5 text-primary" />
    : <FiChevronDown className="w-3.5 h-3.5 text-primary" />;
}

function SortableHeader({
  label, field, current, order, onSort,
}: {
  label: string; field: SortField;
  current: SortField; order: SortOrder;
  onSort: (f: SortField) => void;
}) {
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 font-semibold text-xs uppercase tracking-wide select-none hover:text-foreground transition-colors"
    >
      {label}
      <SortIcon active={current === field} order={order} />
    </button>
  );
}

function PaginationBar({
  page, totalPages, onChange,
}: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm select-none">…</span>
        ) : (
          <Button
            key={p}
            size="sm"
            variant={p === page ? "default" : "outline"}
            onClick={() => onChange(p as number)}
            className="w-9"
          >
            {p}
          </Button>
        ),
      )}
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const LIMIT_OPTIONS = [10, 20, 50];

export default function AdminMoviesClient() {
  const [movies, setMovies]   = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);

  const [page, setPage]         = useState(1);
  const [limit, setLimit]       = useState(20);
  const [search, setSearch]     = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter]           = useState("ALL");
  const [pricingFilter, setPricingFilter]     = useState("ALL");
  const [statusFilter, setStatusFilter]       = useState("ALL");
  const [sortField, setSortField]             = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder]             = useState<SortOrder>("desc");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Media | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadMovies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:      String(page),
        limit:     String(limit),
        sortBy:    sortField,
        sortOrder: sortOrder,
        ...(debouncedSearch              && { search:    debouncedSearch }),
        ...(typeFilter    !== "ALL"      && { type:      typeFilter }),
        ...(pricingFilter !== "ALL"      && { pricing:   pricingFilter }),
        ...(statusFilter  === "published"   && { published: "true" }),
        ...(statusFilter  === "unpublished" && { published: "false" }),
      });
      const data = await api.get<ApiResponse<Media[]>>(`/admin/media?${params}`);
      setMovies(data.data ?? []);
      setTotal(data.meta?.total ?? 0);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, typeFilter, pricingFilter, statusFilter, sortField, sortOrder]);

  useEffect(() => { loadMovies(); }, [loadMovies]);

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setPage(1);
  }

  async function togglePublish(movie: Media) {
    try {
      await api.patch(`/movies/${movie.id}`, { isPublished: !movie.isPublished });
      setMovies((prev) =>
        prev.map((m) => m.id === movie.id ? { ...m, isPublished: !m.isPublished } : m),
      );
      toast.success(`${movie.isPublished ? "Unpublished" : "Published"} "${movie.title}"`);
    } catch {
      toast.error("Failed to update publish status");
    }
  }

  async function deleteMovie(movie: Media) {
    if (!confirm(`Delete "${movie.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/movies/${movie.id}`);
      toast.success("Media deleted");
      loadMovies();
    } catch {
      toast.error("Failed to delete");
    }
  }

  if (showForm || editing) {
    return (
      <AdminMovieForm
        movie={editing ?? undefined}
        onSuccess={() => { setShowForm(false); setEditing(null); loadMovies(); }}
        onCancel={() => { setShowForm(false); setEditing(null); }}
      />
    );
  }

  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Movies &amp; Series</h1>
          <p className="text-sm text-muted-foreground">{total} titles total</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(true)}>
          <FiPlus className="w-4 h-4" /> Add Media
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-52">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="ALL">All Types</option>
          <option value="MOVIE">Movie</option>
          <option value="SERIES">Series</option>
        </select>

        <select
          value={pricingFilter}
          onChange={(e) => { setPricingFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="ALL">All Pricing</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="ALL">All Status</option>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
        </select>

        <select
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {LIMIT_OPTIONS.map((l) => (
            <option key={l} value={l}>{l} / page</option>
          ))}
        </select>

        {(search || typeFilter !== "ALL" || pricingFilter !== "ALL" || statusFilter !== "ALL") && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => { setSearch(""); setTypeFilter("ALL"); setPricingFilter("ALL"); setStatusFilter("ALL"); setPage(1); }}
          >
            <FiX className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border/60">
              <tr>
                <th className="px-4 py-3 text-left w-12 text-xs font-semibold uppercase tracking-wide text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left w-16 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Poster</th>
                <th className="px-4 py-3 text-left text-muted-foreground">
                  <SortableHeader label="Title" field="title" current={sortField} order={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left text-muted-foreground hidden sm:table-cell">Type</th>
                <th className="px-4 py-3 text-left text-muted-foreground hidden md:table-cell">
                  <SortableHeader label="Year" field="year" current={sortField} order={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left text-muted-foreground hidden md:table-cell">Pricing</th>
                <th className="px-4 py-3 text-left text-muted-foreground hidden lg:table-cell">
                  <SortableHeader label="Reviews" field="reviews" current={sortField} order={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left text-muted-foreground hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                Array.from({ length: limit > 10 ? 10 : limit }).map((_, i) => (
                  <tr key={i} className="bg-background">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-6" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-14 w-10 rounded" /></td>
                    <td className="px-4 py-3 space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-5 w-14" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-10" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-5 w-16" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-8" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : movies.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <MdMovieCreation className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No media found.</p>
                    <Button className="mt-4 gap-2" size="sm" onClick={() => setShowForm(true)}>
                      <FiPlus className="w-4 h-4" /> Add First Movie
                    </Button>
                  </td>
                </tr>
              ) : (
                movies.map((movie, i) => (
                  <tr key={movie.id} className="bg-background hover:bg-muted/20 transition-colors">
                    {/* Serial */}
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {startIndex + i + 1}
                    </td>

                    {/* Poster */}
                    <td className="px-4 py-3">
                      <div className="relative w-10 h-14 rounded overflow-hidden bg-muted shrink-0">
                        {movie.posterUrl ? (
                          <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <MdMovieCreation className="w-5 h-5 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3 max-w-64">
                      <p className="font-semibold line-clamp-1 text-sm">{movie.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {movie.genre.slice(0, 3).join(", ")}
                      </p>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">
                        {movie.type === "MOVIE" ? "Movie" : "Series"}
                      </Badge>
                    </td>

                    {/* Year */}
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs font-mono">
                      {movie.releaseYear}
                    </td>

                    {/* Pricing */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      {movie.pricing === "premium" ? (
                        <Badge className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/30 border font-medium">
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                          Free
                        </Badge>
                      )}
                    </td>

                    {/* Reviews */}
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs font-mono">
                      {movie._count.reviews}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {movie.isPublished ? (
                        <Badge className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-600 border-green-500/30 border font-medium">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-muted-foreground font-medium">
                          Unpublished
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 text-muted-foreground hover:text-foreground"
                          title="Edit"
                          onClick={() => setEditing(movie)}
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 text-muted-foreground hover:text-foreground"
                          title={movie.isPublished ? "Unpublish" : "Publish"}
                          onClick={() => togglePublish(movie)}
                        >
                          {movie.isPublished
                            ? <FiEyeOff className="w-3.5 h-3.5" />
                            : <FiEye className="w-3.5 h-3.5" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Delete"
                          onClick={() => deleteMovie(movie)}
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer: count + pagination */}
      {!loading && movies.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Showing {startIndex + 1}–{Math.min(startIndex + limit, total)} of {total} titles
          </p>
          <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
