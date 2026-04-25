import { MovieCardSkeleton } from "@/components/movies/movie-card";

export default function MoviesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 w-40 bg-muted rounded animate-pulse mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
