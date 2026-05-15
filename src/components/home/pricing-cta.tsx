import Link from "next/link";
import Image from "next/image";
import {
  FiArrowRight, FiCheck, FiAward, FiStar, FiZap,
} from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import type { ApiResponse, Review } from "@/types";

const API = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getTopReviews(): Promise<Review[]> {
  try {
    const res = await fetch(`${API}/api/reviews?sortBy=mostLiked&limit=3`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const json: ApiResponse<Review[]> = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <AiFillStar
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "text-amber-400" : "text-muted-foreground/20"}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initials = review.user?.name
    ? review.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const excerpt =
    review.content.length > 160
      ? review.content.slice(0, 157).trimEnd() + "…"
      : review.content;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 hover:border-primary/30 hover:bg-card transition-all duration-300">
      <StarRow rating={review.rating} />

      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
        &ldquo;{excerpt}&rdquo;
      </p>

      <div className="flex items-center gap-3 pt-3 border-t border-border/40">
        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary/15 flex items-center justify-center shrink-0">
          {review.user?.image ? (
            <Image
              src={review.user.image}
              alt={review.user.name}
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            <span className="text-[11px] font-bold text-primary">{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate">{review.user?.name ?? "Anonymous"}</p>
          {review.media?.title && (
            <p className="text-[11px] text-muted-foreground truncate">
              on{" "}
              <Link
                href={`/movies/${review.mediaId}`}
                className="hover:text-primary transition-colors"
              >
                {review.media.title}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const MONTHLY_PERKS = [
  "Unlimited reviews & comments",
  "Access all premium content",
  "Ad-free experience",
  "Advanced filters",
];

const ANNUAL_EXTRAS = [
  "Everything in Monthly",
  "2 months free (save 33%)",
  "Download for offline viewing",
  "Exclusive profile badge",
];

export default async function PricingCta() {
  const reviews = await getTopReviews();

  return (
    <section className="relative py-16 overflow-hidden bg-background border-t border-border/40">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/4 w-125 h-100 bg-primary/5 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-100 h-75 bg-purple-500/5 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 max-w-6xl space-y-10">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 border border-primary/20 bg-primary/5 rounded-full px-4 py-1.5 text-sm text-primary font-medium">
            <FiZap className="w-3.5 h-3.5" /> Loved by our community
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Unlock the full experience
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Join thousands of film lovers already reviewing, rating, and discussing their
            favourite titles every day.
          </p>
        </div>

        {/* ── Real reviews from the DB ───────────────────────────────── */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}

        {/* ── Plan cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Monthly */}
          <div className="relative flex flex-col gap-5 rounded-2xl border-2 border-primary bg-card p-6 shadow-xl shadow-primary/10">
            <div className="absolute -top-3 left-6">
              <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <FiAward className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Monthly Pro</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">$9.99</span>
                  <span className="text-muted-foreground text-sm">/mo</span>
                </div>
              </div>
            </div>

            <ul className="space-y-2">
              {MONTHLY_PERKS.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FiCheck className="w-4 h-4 text-primary shrink-0" />
                  {p}
                </li>
              ))}
            </ul>

            <Link
              href="/pricing"
              className="mt-auto flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              Get Monthly Pro <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Annual */}
          <div className="flex flex-col gap-5 rounded-2xl border border-purple-500/40 bg-card p-6 hover:border-purple-500/70 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <FiStar className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Annual Premium</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">$6.67</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                Save 33%
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground -mt-2">Billed $79.99 / year — 2 months free</p>

            <ul className="space-y-2">
              {ANNUAL_EXTRAS.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FiCheck className="w-4 h-4 text-purple-400 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>

            <Link
              href="/pricing"
              className="mt-auto flex items-center justify-center gap-2 h-11 rounded-xl border border-purple-500/50 bg-purple-500/10 text-purple-300 font-semibold text-sm hover:bg-purple-500/20 hover:border-purple-500 transition-all"
            >
              Get Annual Premium <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ── Footer note ────────────────────────────────────────────── */}
        <p className="text-center text-sm text-muted-foreground">
          Not ready to commit?{" "}
          <Link href="/sign-up" className="text-foreground font-medium hover:text-primary transition-colors">
            Start free
          </Link>{" "}
          — no credit card required.{" "}
          <Link href="/pricing" className="text-primary font-medium hover:underline">
            Compare all plans →
          </Link>
        </p>
      </div>
    </section>
  );
}
