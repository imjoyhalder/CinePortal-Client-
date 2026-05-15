import type { Metadata } from "next";
import HeroSection from "@/components/home/hero-section";
import FeatureStrip from "@/components/home/feature-strip";
import TrendingSection from "@/components/home/trending-section";
import HowItWorks from "@/components/home/how-it-works";
import StatsSection from "@/components/home/stats-section";
import PricingCta from "@/components/home/pricing-cta";
import type { ApiResponse, FeaturedResponse } from "@/types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "CinePortal — Discover & Rate Movies",
  description:
    "Explore thousands of movies and TV shows. Read honest reviews, rate what you've watched, and share your thoughts with a community of film lovers.",
};

async function getFeatured(): Promise<FeaturedResponse | null> {
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/movies/featured`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const json: ApiResponse<FeaturedResponse> = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const featured = await getFeatured();
  const topRated = featured?.topRated ?? [];
  const newlyAdded = featured?.newlyAdded ?? [];

  const heroPosters = [...topRated, ...newlyAdded]
    .slice(0, 6)
    .map((m) => m.posterUrl);

  return (
    <>
      {/* 1. Immediate impact — headline + search + poster grid */}
      <HeroSection posters={heroPosters} />

      {/* 2. What can I do here? — quick feature icons */}
      <FeatureStrip />

      {/* 3. Show real content immediately — builds desire */}
      <TrendingSection movies={topRated} title="Trending This Week" />

      {/* 4. How do I get started? — 3-step explainer */}
      <HowItWorks />

      {/* 5. Is this legit? — bold social proof numbers */}
      <StatsSection />

      {/* 6. More content to browse */}
      <TrendingSection movies={newlyAdded} title="Newly Added" />

      {/* 7. Real reviews + plan cards — final conversion */}
      <PricingCta />
    </>
  );
}
