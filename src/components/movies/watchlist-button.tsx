"use client";

import { useState } from "react";
import { FiBookmark } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export default function WatchlistButton({ mediaId }: { mediaId: string }) {
  const { data: session } = useSession();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!session) { toast.error("Sign in to manage your watchlist"); return; }
    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; data: { added: boolean } }>(
        "/watchlist/toggle",
        { mediaId }
      );
      setAdded(res.data!.added);
      toast.success(res.data!.added ? "Added to watchlist" : "Removed from watchlist");
    } catch {
      toast.error("Failed to update watchlist");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" className="gap-2" onClick={toggle} disabled={loading}>
      <FiBookmark className={`w-4 h-4 ${added ? "fill-current text-primary" : ""}`} />
      {added ? "In Watchlist" : "Add to Watchlist"}
    </Button>
  );
}
