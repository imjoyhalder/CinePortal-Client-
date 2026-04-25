import Link from "next/link";
import { FiArrowRight, FiTrendingUp, FiClock } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import MovieCard from "@/components/movies/movie-card";
import type { Media } from "@/types";

interface FeaturedSectionProps {
  topRated: Media[];
  newlyAdded: Media[];
}

function SectionHeader({ icon, title, subtitle, href }: { icon: React.ReactNode; title: string; subtitle: string; href: string }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div className="flex items-center gap-2 text-primary mb-1">
          {icon}
          <span className="text-sm font-medium uppercase tracking-wider">{subtitle}</span>
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-primary" asChild>
        <Link href={href}>
          See all <FiArrowRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}

export default function FeaturedSection({ topRated, newlyAdded }: FeaturedSectionProps) {
  return (
    <div className="bg-background">
      {/* Top Rated */}
      {topRated.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <SectionHeader
            icon={<FiTrendingUp className="w-4 h-4" />}
            subtitle="Community Favorites"
            title="Top Rated This Week"
            href="/movies?sortBy=mostReviewed"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {topRated.map((media) => (
              <MovieCard key={media.id} media={media} />
            ))}
          </div>
        </section>
      )}

      {/* Newly Added */}
      {newlyAdded.length > 0 && (
        <section className="container mx-auto px-4 py-16 border-t border-border/30">
          <SectionHeader
            icon={<FiClock className="w-4 h-4" />}
            subtitle="Fresh Arrivals"
            title="Newly Added"
            href="/movies"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {newlyAdded.map((media) => (
              <MovieCard key={media.id} media={media} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {topRated.length === 0 && newlyAdded.length === 0 && (
        <section className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">No content available yet. Check back soon!</p>
          <Button className="mt-4" asChild>
            <Link href="/movies">Browse All</Link>
          </Button>
        </section>
      )}
    </div>
  );
}
