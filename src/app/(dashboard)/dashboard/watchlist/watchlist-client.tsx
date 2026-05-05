"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiBookmark, FiTrash2 } from "react-icons/fi";
import { MdMovieCreation } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { ApiResponse, WatchlistItem } from "@/types";

export default function DashboardWatchlistClient() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!isPending && !session) { router.push("/sign-in"); return; }
    if (!session) return;

    api.get<ApiResponse<WatchlistItem[]>>("/watchlist")
      .then((r) => setWatchlist(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, isPending, router]);

  async function remove(mediaId: string) {
    try {
      await api.delete(`/watchlist/${mediaId}`);
      setWatchlist((prev) => prev.filter((i) => i.media.id !== mediaId));
      toast.success("Removed from watchlist");
    } catch { toast.error("Failed to remove"); }
  }

  if (isPending || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-2/3 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <p className="text-sm text-muted-foreground">
          {watchlist.length} title{watchlist.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      {watchlist.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <FiBookmark className="w-8 h-8 opacity-30" />
          </div>
          <p className="font-semibold text-foreground mb-1">Watchlist is empty</p>
          <p className="text-sm mb-5">Save movies and series to watch later.</p>
          <Button asChild><Link href="/movies">Browse Movies</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {watchlist.map(({ media }) => (
            <Card key={media.id} className="group overflow-hidden border-border/50 hover:border-primary/40 transition-colors">
              <div className="relative aspect-2/3 bg-muted">
                {media.posterUrl ? (
                  <Image src={media.posterUrl} alt={media.title} fill className="object-cover" sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 180px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MdMovieCreation className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                )}
                <button
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  onClick={(e) => { e.preventDefault(); remove(media.id); }}
                  title="Remove from watchlist"
                >
                  <FiTrash2 className="w-3.5 h-3.5 text-white" />
                </button>
                <div className="absolute top-2 left-2">
                  <Badge className={`text-xs ${media.pricing === "premium" ? "bg-primary text-primary-foreground" : "bg-black/50 border-white/10"}`}>
                    {media.pricing === "premium" ? "Premium" : "Free"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-2.5">
                <Link href={`/movies/${media.id}`} className="hover:text-primary transition-colors">
                  <p className="text-xs font-semibold line-clamp-2 leading-tight">{media.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{media.releaseYear}</p>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
