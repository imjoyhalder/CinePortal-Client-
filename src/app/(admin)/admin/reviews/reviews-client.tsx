"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiCheck, FiEyeOff, FiSearch, FiX,
  FiChevronUp, FiChevronDown,
} from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import { MdOutlineRateReview } from "react-icons/md";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { ApiResponse, Review } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type SortField = "rating" | "createdAt";
type SortOrder = "asc" | "desc";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  APPROVED:    "bg-green-500/10 text-green-600 border-green-500/30",
  PENDING:     "bg-amber-500/10 text-amber-600 border-amber-500/30",
  UNPUBLISHED: "bg-muted text-muted-foreground border-border",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <AiFillStar key={s} className={`w-3 h-3 ${s <= rating ? "text-amber-400" : "text-muted-foreground/20"}`} />
      ))}
      <span className="ml-1 text-xs font-mono font-bold">{rating}</span>
    </div>
  );
}

function SortableHeader({ label, field, current, order, onSort }: {
  label: string; field: SortField; current: SortField; order: SortOrder; onSort: (f: SortField) => void;
}) {
  const active = current === field;
  return (
    <button onClick={() => onSort(field)} className="flex items-center gap-1 font-semibold text-xs uppercase tracking-wide select-none hover:text-foreground transition-colors">
      {label}
      {active && order === "asc"
        ? <FiChevronUp className="w-3 h-3 text-primary" />
        : active
        ? <FiChevronDown className="w-3 h-3 text-primary" />
        : <span className="flex flex-col opacity-40"><FiChevronUp className="w-2.5 h-2.5 -mb-0.5" /><FiChevronDown className="w-2.5 h-2.5" /></span>
      }
    </button>
  );
}

function PaginationBar({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
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
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
      {pages.map((p, i) =>
        p === "…"
          ? <span key={`e-${i}`} className="px-2 text-muted-foreground text-sm select-none">…</span>
          : <Button key={p} size="sm" variant={p === page ? "default" : "outline"} className="w-9" onClick={() => onChange(p as number)}>{p}</Button>
      )}
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</Button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const LIMIT = 20;

export default function AdminReviewsClient() {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);

  const [search, setSearch]           = useState("");
  const [debouncedSearch, setDebounced] = useState("");
  const [status, setStatus]           = useState("ALL");
  const [sortField, setSortField]     = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder]     = useState<SortOrder>("desc");

  // Derived loading: true whenever the request key hasn't resolved yet
  const requestKey = `${page}|${status}|${debouncedSearch}|${sortField}|${sortOrder}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = requestKey !== loadedKey;

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), sortBy: sortField, sortOrder });
    if (status !== "ALL") params.set("status", status);
    if (debouncedSearch) params.set("search", debouncedSearch);

    api.get<ApiResponse<Review[]>>(`/admin/reviews?${params}`)
      .then((data) => {
        if (cancelled) return;
        setReviews(data.data ?? []);
        setTotal(data.meta?.total ?? 0);
        setLoadedKey(requestKey);
      })
      .catch(() => {
        if (cancelled) return;
        setReviews([]);
        setLoadedKey(requestKey);
      });
    return () => { cancelled = true; };
  // requestKey encodes all deps — only it is needed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  function handleSort(field: SortField) {
    if (field === sortField) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortOrder("desc"); }
    setPage(1);
  }

  async function moderate(id: string, newStatus: "APPROVED" | "UNPUBLISHED") {
    try {
      await api.patch(`/admin/reviews/${id}/moderate`, { status: newStatus });
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success(`Review ${newStatus === "APPROVED" ? "approved" : "unpublished"}`);
    } catch {
      toast.error("Failed to moderate review");
    }
  }

  const totalPages = Math.ceil(total / LIMIT);
  const startIndex = (page - 1) * LIMIT;
  const hasFilters = search || status !== "ALL";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-52">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by user or movie…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="UNPUBLISHED">Unpublished</option>
        </select>

        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => { setSearch(""); setStatus("ALL"); setPage(1); }}>
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
                <th className="px-4 py-3 text-left w-10 text-xs font-semibold uppercase tracking-wide text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Movie</th>
                <th className="px-4 py-3 text-left text-muted-foreground hidden sm:table-cell">
                  <SortableHeader label="Rating" field="rating" current={sortField} order={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden lg:table-cell">Review</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 text-left text-muted-foreground hidden md:table-cell">
                  <SortableHeader label="Date" field="createdAt" current={sortField} order={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="bg-background">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-6" /></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><Skeleton className="w-7 h-7 rounded-full" /><Skeleton className="h-4 w-24" /></div></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-7 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <MdOutlineRateReview className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No reviews found.</p>
                  </td>
                </tr>
              ) : (
                reviews.map((review, i) => (
                  <tr key={review.id} className="bg-background hover:bg-muted/20 transition-colors">
                    {/* # */}
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{startIndex + i + 1}</td>

                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="w-7 h-7 shrink-0">
                          <AvatarImage src={review.user?.image ?? undefined} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {review.user?.name?.charAt(0).toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate max-w-28">{review.user?.name ?? "—"}</span>
                      </div>
                    </td>

                    {/* Movie — clickable → public movie page */}
                    <td className="px-4 py-3 max-w-44">
                      {review.media ? (
                        <Link
                          href={`/movies/${review.media.id}`}
                          className="text-sm font-semibold text-primary hover:underline line-clamp-1"
                        >
                          {review.media.title}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <StarRating rating={review.rating} />
                    </td>

                    {/* Content preview */}
                    <td className="px-4 py-3 hidden lg:table-cell max-w-64">
                      <p className="text-xs text-muted-foreground line-clamp-2">{review.content}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-medium border ${STATUS_STYLE[review.status] ?? ""}`}>
                        {review.status}
                      </Badge>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {review.status !== "APPROVED" && (
                          <Button size="sm" className="h-7 gap-1 text-xs px-2" onClick={() => moderate(review.id, "APPROVED")}>
                            <FiCheck className="w-3 h-3" /><span className="hidden sm:inline">Approve</span>
                          </Button>
                        )}
                        {review.status !== "UNPUBLISHED" && (
                          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs px-2" onClick={() => moderate(review.id, "UNPUBLISHED")}>
                            <FiEyeOff className="w-3 h-3" /><span className="hidden sm:inline">Hide</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      {!loading && reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Showing {startIndex + 1}–{Math.min(startIndex + LIMIT, total)} of {total} reviews
          </p>
          <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
