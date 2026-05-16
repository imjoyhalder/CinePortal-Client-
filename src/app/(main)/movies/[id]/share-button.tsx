"use client";

import { useState } from "react";
import { FiShare2, FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled or API unavailable — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="outline" className="gap-2 rounded-full" onClick={handleShare}>
      {copied ? <FiCheck className="w-4 h-4 text-green-400" /> : <FiShare2 className="w-4 h-4" />}
      {copied ? "Copied!" : "Share"}
    </Button>
  );
}
