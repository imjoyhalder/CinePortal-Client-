import type { Metadata } from "next";
import HeroSection from "@/components/home/hero-section";
import FeatureStrip from "@/components/home/feature-strip";
import TrendingSection from "@/components/home/trending-section";
import FeaturedSection from "@/components/home/featured-section";
import StatsSection from "@/components/home/stats-section";
import PricingSection from "@/components/home/pricing-section";
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

  // First 6 poster URLs from the combined list — passed to the hero grid
  const heroPosters = [...topRated, ...newlyAdded]
    .slice(0, 6)
    .map((m) => m.posterUrl);

  return (
    <>
      <HeroSection posters={heroPosters} />
      <FeatureStrip />
      <TrendingSection movies={topRated} title="Trending This Week" />
      <TrendingSection movies={newlyAdded} title="Newly Added" />
      <FeaturedSection topRated={topRated} newlyAdded={newlyAdded} />
      <StatsSection />
      <PricingSection />
    </>
  );
}
