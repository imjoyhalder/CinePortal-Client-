"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiSearch, FiPlay, FiUsers } from "react-icons/fi";
import { MdMovieCreation } from "react-icons/md";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FALLBACK_POSTERS = [
  "https://image.tmdb.org/t/p/w500/d5NXSklpcvkmXyZSoHjBnFbNcMH.jpg",
  "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
  "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLebHly2DkEy.jpg",
  "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
];

interface HeroSectionProps {
  posters?: (string | null | undefined)[];
}

function PosterCard({ src, offset }: { src: string; offset: string }) {
  const [errored, setErrored] = useState(false);

  return (
    <div
      className="relative aspect-2/3 rounded-xl overflow-hidden shadow-2xl bg-muted ring-1 ring-white/5"
      style={{ transform: `translateY(${offset})` }}
    >
      {!errored ? (
        <Image
          src={src}
          alt="Movie poster"
          fill
          className="object-cover"
          sizes="180px"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <MdMovieCreation className="w-10 h-10 text-muted-foreground/30" />
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
    </div>
  );
}

export default function HeroSection({ posters = [] }: HeroSectionProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const displayPosters = Array.from({ length: 6 }, (_, i) =>
    posters[i] || FALLBACK_POSTERS[i]
  );

  // Stagger offsets: middle col floats up, outer cols neutral
  const offsets = ["-8px", "-24px", "-8px", "8px", "24px", "8px"];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/movies?search=${encodeURIComponent(query.trim())}`);
  }

  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-background">
      {/* Ambient glow behind poster grid */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none hidden lg:block"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 80% 50%, oklch(0.75 0.15 60 / 0.06) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 py-16 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[80vh]">

          {/* ── Left: content ─────────────────────────────── */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary font-medium">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Thousands of titles. One platform.
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
              Discover &amp;{" "}
              <span className="text-gradient">Rate</span>
              <br />
              Your Favorites
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Explore thousands of movies and TV shows. Read honest reviews, rate
              what you&apos;ve watched, and share your thoughts with a community
              of film lovers.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search movies, series, directors..."
                  className="w-full h-11 pl-10 pr-4 bg-card border border-border/60 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 transition-all placeholder:text-muted-foreground/60"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="h-11 px-5 font-semibold shrink-0">
                Search
              </Button>
            </form>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/movies"
                className={cn(buttonVariants({ size: "lg" }), "gap-2 h-11 px-5 font-semibold")}
              >
                <FiPlay className="w-4 h-4" />
                Browse Movies
              </Link>
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "gap-2 h-11 px-5 font-semibold"
                )}
              >
                <FiUsers className="w-4 h-4" />
                Join Community
              </Link>
            </div>

            {/* Trust stats */}
            <div className="flex flex-wrap items-center gap-8 pt-2">
              {[
                { value: "10K+", label: "Movies & TV Shows" },
                { value: "50K+", label: "Reviews" },
                { value: "25K+", label: "Members" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: poster grid ─────────────────────────── */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
              {displayPosters.map((src, i) => (
                <PosterCard key={i} src={src} offset={offsets[i]} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
