export default function MovieDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Backdrop skeleton */}
      <div className="relative h-[50vh] rounded-xl bg-muted mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-t from-background to-transparent pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-10 w-3/4 bg-muted rounded" />
          <div className="h-4 w-1/2 bg-muted rounded" />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-6 w-16 bg-muted rounded-full" />)}
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-6 w-32 bg-muted rounded" />
          {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-muted rounded" />)}
        </div>
      </div>
    </div>
  );
}
