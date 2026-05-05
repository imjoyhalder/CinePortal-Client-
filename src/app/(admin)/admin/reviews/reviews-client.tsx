"use client";

import { useState, useEffect } from "react";
import { FiCheck, FiX, FiEyeOff } from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { ApiResponse, Review } from "@/types";

export default function AdminReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: "20" });
        if (status !== "ALL") params.set("status", status);
        const data = await api.get<ApiResponse<Review[]>>(`/admin/reviews?${params}`);
        if (!cancelled) { setReviews(data.data ?? []); setTotal(data.meta?.total ?? 0); }
      } catch { if (!cancelled) setReviews([]); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [status, page]);

  async function moderate(id: string, newStatus: "APPROVED" | "UNPUBLISHED") {
    try {
      await api.patch(`/admin/reviews/${id}/moderate`, { status: newStatus });
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success(`Review ${newStatus.toLowerCase()}`);
    } catch { toast.error("Failed to moderate review"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-sm text-muted-foreground">{total} reviews</p>
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v ?? "PENDING"); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="UNPUBLISHED">Unpublished</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-card rounded-xl animate-pulse border border-border/50" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No reviews found.</div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id} className="border-border/50">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{review.user?.name ?? "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">on</span>
                      <span className="text-sm text-primary">{review.media?.title}</span>
                      <div className="flex items-center gap-0.5">
                        <AiFillStar className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold">{review.rating}/10</span>
                      </div>
                      <Badge
                        variant={review.status === "APPROVED" ? "default" : review.status === "PENDING" ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {review.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{review.content}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {review.status !== "APPROVED" && (
                      <Button size="sm" className="h-8 gap-1" onClick={() => moderate(review.id, "APPROVED")}>
                        <FiCheck className="w-3 h-3" /> Approve
                      </Button>
                    )}
                    {review.status !== "UNPUBLISHED" && (
                      <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => moderate(review.id, "UNPUBLISHED")}>
                        <FiEyeOff className="w-3 h-3" /> Unpublish
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {Math.ceil(total / 20) > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / 20)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
