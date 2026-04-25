"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import ReviewForm from "./review-form";
import Link from "next/link";

export default function ReviewFormWrapper({ mediaId }: { mediaId: string }) {
  const { data: session } = useSession();
  const [show, setShow] = useState(false);

  if (!session) {
    return (
      <div className="bg-card rounded-xl border border-border/50 p-6 text-center">
        <p className="text-muted-foreground mb-3">Sign in to write a review</p>
        <Button asChild><Link href="/sign-in">Sign In</Link></Button>
      </div>
    );
  }

  if (!show) {
    return (
      <Button onClick={() => setShow(true)} variant="outline" className="w-full sm:w-auto">
        Write a Review
      </Button>
    );
  }

  return (
    <ReviewForm
      mediaId={mediaId}
      onSuccess={() => setShow(false)}
      onCancel={() => setShow(false)}
    />
  );
}
