import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReviewsLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 flex-1 min-w-52" />
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="rounded-lg border border-border/60 overflow-hidden">
        <div className="bg-muted/40 border-b border-border/60 px-4 py-3">
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="divide-y divide-border/40">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 bg-background">
              <Skeleton className="h-4 w-6 shrink-0" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20 hidden sm:block" />
              <Skeleton className="h-4 w-48 hidden lg:block flex-1" />
              <Skeleton className="h-5 w-20 hidden sm:block" />
              <Skeleton className="h-4 w-20 hidden md:block" />
              <Skeleton className="h-7 w-20 ml-auto shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
