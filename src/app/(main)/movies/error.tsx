"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FiAlertCircle } from "react-icons/fi";

export default function MoviesError({
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
      <h2 className="text-xl font-semibold">Failed to load movies</h2>
      <p className="text-muted-foreground text-sm max-w-sm">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
