"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FiAlertCircle, FiArrowLeft } from "react-icons/fi";

export default function MovieDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center gap-4 text-center">
      <FiAlertCircle className="w-12 h-12 text-destructive" />
      <h2 className="text-xl font-semibold">Failed to load movie</h2>
      <p className="text-muted-foreground text-sm max-w-sm">{error.message}</p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild className="gap-2">
          <Link href="/movies"><FiArrowLeft className="w-4 h-4" /> Back to Movies</Link>
        </Button>
      </div>
    </div>
  );
}
