"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiTrash2, FiBookmark } from "react-icons/fi";
import { MdMovieCreation } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { ApiResponse, WatchlistItem } from "@/types";

export default function WatchlistClient() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) { router.push("/sign-in"); return; }
    if (!session) return;
    api.get<ApiResponse<WatchlistItem[]>>("/watchlist")
      .then((r) => setItems(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, isPending, router]);

  async function remove(mediaId: string) {
    try {
      await api.delete(`/watchlist/${mediaId}`);
      setItems((prev) => prev.filter((i) => i.media.id !== mediaId));
      toast.success("Removed from watchlist");
    } catch { toast.error("Failed to remove"); }
  }

  if (isPending || loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-2/3 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FiBookmark className="text-primary" /> My Watchlist
        </h1>
        <p className="text-muted-foreground mt-1">{items.length} titles saved</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <FiBookmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your watchlist is empty</h2>
          <p className="text-muted-foreground mb-6">Save movies and series to watch later</p>
          <Button asChild><Link href="/movies">Browse Movies</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map(({ media }) => (
            <Card key={media.id} className="group overflow-hidden border-border/50 card-hover">
              <div className="relative aspect-2/3 bg-muted">
                {media.posterUrl ? (
                  <Image src={media.posterUrl} alt={media.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MdMovieCreation className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
                {/* Remove button */}
                <button
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  onClick={(e) => { e.preventDefault(); remove(media.id); }}
                >
                  <FiTrash2 className="w-3.5 h-3.5 text-white" />
                </button>
                <div className="absolute top-2 left-2">
                  <Badge className={`text-xs ${media.pricing === "premium" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    {media.pricing === "premium" ? "Premium" : "Free"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-2">
                <Link href={`/movies/${media.id}`} className="hover:text-primary transition-colors">
                  <p className="text-xs font-medium line-clamp-1">{media.title}</p>
                  <p className="text-xs text-muted-foreground">{media.releaseYear}</p>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
